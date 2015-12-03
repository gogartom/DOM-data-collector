// ####################################################################################

// --- RENDERING PAGES --- //

var RenderUrlsToFile, arrayOfUrls, system, fs;
var xpaths = [];

system = require("system");
fs = require('fs');


/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function(urls, path, prefix, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    webpage = require("webpage");
    page = null;
    
    // function - get filename
    getFilename = function(url) {
        return prefix+"_images/"+prefix+"-" + urlIndex + ".jpeg"
        // return path+url.replace('/','_') + ".png"
    };

    // function - closes page, and gets another one
    next = function(status, url, file, typedObjects, visibleBBs) {
        page.close();
        callbackPerUrl(status, url, file, typedObjects, visibleBBs);
        return retrieve();
    };

    getElementByXpath = function(path) {
        el =  document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (el){
            bb = el.getBoundingClientRect();
            return {text: el.textContent, boundingBox: [bb.left, bb.top, bb.right, bb.bottom]};
        }
    }

    getVisibleBoundingBoxes = function(){
        // get all elements
        var elements = document.querySelectorAll("*");
        
        // save visible bounding boxes to list
        var listOfObjects = [];
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            
            // if is visible
            // if(element.offsetParent === null) {
                bb = element.getBoundingClientRect();
                
                // if it is not zero sized
                if(bb.width!=0 && bb.height!=0){
                    listOfObjects.push([bb.left, bb.top, bb.right, bb.bottom]);
                }
                
            // }
        }
        return listOfObjects
    }

    // function - render next url
    retrieve = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            urlIndex++;
            
            page = webpage.create();
            page.viewportSize = {
                width: 1920,
                height: 1000
            };

            page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.0.0 Safari/538.1 (CVUT-Cloud_Computing_Center BOT)"
            page.onConsoleMessage = function(msg) {
              console.log(msg);
            };

            // page.settings.userAgent = "Phantom.js bot";
            return page.open(url, function(status) {
                var file;
                file = getFilename(url);

                if (status === "success") {

                    //after 200 ms - press ESCAPE
                    window.setTimeout((function() {
                        page.sendEvent('keypress', page.event.key.Escape);
                    }), 400);

                     //after 300 ms - start parsing and rendering
                    return window.setTimeout((function() {
                        //--- FIND INTERESTING TYPED OBJECTS AND SAVE TO LIST
                        var typedObjects = [];
                        // var name = page.evaluate(getElementByXpath,'//*[@id=\'h1c\']/h1');                                                  // //*[@id='h1c']/h1
                        // var price = page.evaluate(getElementByXpath,'//*[@id=\'prices\']/tbody/tr/td/div[2]/div/div[1]/div[2]/span');       // //*[@id='prices']/tbody/tr/td/div[2]/div/div[1]/div[2]/span
                        // var main_image = page.evaluate(getElementByXpath,'//*[@id=\'imgMain\']');                                           // //*[@id='imgMain']
                        // var short_text = page.evaluate(getElementByXpath,'//*[@id=\'detailText\']/div[2]/span');       

                        var name = page.evaluate(getElementByXpath,xpaths["name"]);                                                  // //*[@id='h1c']/h1
                        var price = page.evaluate(getElementByXpath,xpaths["price"]);       // //*[@id='prices']/tbody/tr/td/div[2]/div/div[1]/div[2]/span
                        var main_image = page.evaluate(getElementByXpath,xpaths["main_image"]);                                           // //*[@id='imgMain']
                        var short_text = page.evaluate(getElementByXpath,xpaths["short_text"]);

                        //--- if everything was detected properly
                        if(name && price && main_image && short_text){
                            name["type"] = "name";
                            price["type"] = "price";
                            main_image["type"] = "main_image";
                            short_text["type"] = "short_text";

                            typedObjects.push(name);
                            typedObjects.push(price);
                            typedObjects.push(main_image);
                            typedObjects.push(short_text);

                            var visibleBBs = page.evaluate(getVisibleBoundingBoxes);

                            page.render(file,{format: 'jpeg', quality: '100'});

                            return next(status, url, file, typedObjects, visibleBBs);
                        }else{
                            // log what is missing
                            if (!name){
                                console.log("Error: "+url+" - missing name");
                            }
                            if (!price){
                                console.log("Error: "+url+" - missing price");
                            }
                            if (!main_image){
                                console.log("Error: "+url+" - missing main_image");
                            }
                            if (!short_text){
                                console.log("Error: "+url+" - missing short_text");
                            }
                            next("parsing_error", url, file, null, null);
                        }
                    }), 600);
                } else {
                    return next(status, url, file, null, null);
                }
            });
        } else {
            return callbackFinal();
        }
    };

    return retrieve();
};

// ####################################################################################

// --- FUNCTIONS --- //

cleanText = function(text){
            str = ''+text.replace(/ +(?= )/g,'') //replace multiple spaces
            str = str.replace(/(\r\n|\n|\r)/gm,' '); // remove newlines
            str = str.trim();    //trim
            return str;
}

// --- URL PROCESSED - CALLBACK FUNCTION
callbackPerUrl = function(status, url, file, typedObjects, visibleBBs) {
    // Save only succesful renders
    if (status === "success"){
        console.log(url);

        var object = {
            url:  url,
            image: file,
            typedObjects: typedObjects,
            visibleBB: visibleBBs
        };

        // if does not exist, start array
        if (!fs.exists(output_path)){
            fs.write(output_path, "[", 'w+');
        }else{
            fs.write(output_path, ",\n", 'w+');
        }

        // write json object
        var content = JSON.stringify(object);
        fs.write(output_path, content, 'w+');
        return;    
    }
    // Could not parse all xpaths
    else if (status === "parsing_error"){
        return console.error("Parsing error '" + url + "'");
    }
    // Could not download
    else{
        return console.error("Unable to render '" + url + "'");
    }
};

// --- Final CALLBACK FUNCTION 
callbackFinal = function() {
    // close array
    fs.write(output_path, "]", 'w+');
    return phantom.exit();
};

loadXpathRules = function(rules_path){
    f = fs.open(rules_path, "r");
    content = f.read();
    rules = JSON.parse(content);
    for (var i=0; i<rules.length; i++){
        var rule = rules[i];
        xpaths[rule["type"]]=rule["xpath"];    
        
    }
}

// ####################################################################################

// --- READ PARAMS --- //

var input_path, output_path;

arrayOfUrls = null;
if (system.args.length == 5) {
    var input_path = system.args[1];
    var xpath_rules = system.args[2];
    var output_path = system.args[3];
    var prefix = system.args[4];
    // arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs render_multi_url.js INPUT_PATH XPATH_RULES OUTPUT_PATH IMAGE_PREFIX");
    phantom.exit(1);
}

// --- LOAD URLS ---//
f = fs.open(input_path, "r");
content = f.read();
arrayOfUrls = content.split("\n");

// --- LOAD RULES ---//
loadXpathRules(xpath_rules);

// --- RUN --- //
RenderUrlsToFile(arrayOfUrls, "images/",prefix ,callbackPerUrl, callbackFinal);
