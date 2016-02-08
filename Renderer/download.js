// ####################################################################################

// --- RENDERING PAGES --- //
var RenderUrlsToFile, arrayOfUrls, system, fs;
var xpaths = [];
var MAX_WIDTH = 1920;
system = require("system");
fs = require('fs');


/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function(urls, prefix, callbackPerUrl, callbackFinal) {
    var getImagePath, getImageFilename, getAnnotationPath, getListPath, formatNumberLength, next, page, retrieve, urlIndex, webpage;
    
    urlIndex = 1;
    webpage = require("webpage");
    page = null;
    
    // function - get filename
    getImagePath = function(prefix, urlIndex) {
        return prefix+"_images/"+prefix+"-" + formatNumberLength(urlIndex,6) + ".jpeg"
    }

    getImageFilename = function(prefix, urlIndex) {
        return prefix+"-" + formatNumberLength(urlIndex,6)
    }    

    getAnnotationPath = function(prefix,urlIndex){
         return prefix+"_annotations/"+prefix+"-" + formatNumberLength(urlIndex,6) + ".json"
    }

    getListPath = function(prefix){
         return prefix+".txt"
    }

    formatNumberLength = function(num, length) {
        var r = "" + num;
        while (r.length < length) {
            r = "0" + r;
        }
        return r;
    }

    // function - closes page, and gets another one
    next = function(status, url, image_filename, annotation_path, list_path, typedObjects, visibleBBs, textBBs) {
        page.close();
        callbackPerUrl(status, url, image_filename, annotation_path, list_path, typedObjects, visibleBBs, textBBs);
        return retrieve();
    };

    getElementByXpath = function(path,max_width) {
        el =  document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (el){
            bb = el.getBoundingClientRect();
            
            // if it is not zero sized
            if(bb.width>0 && bb.height>0){
                // if it is not "out of page"
                if(bb.left>=0 && bb.top >=0 && bb.right <= max_width){             
                    return {text: el.textContent, boundingBox: [Math.round(bb.left), Math.round(bb.top), Math.round(bb.right), Math.round(bb.bottom)]};
                }
            }
        }
    }

    getVisibleBoundingBoxes = function(max_width){
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
            if(bb.width>0 && bb.height>0){

                // if it is not "out of page"
                if(bb.left>=0 && bb.top >=0 && bb.right <= max_width){
                    listOfObjects.push([Math.round(bb.left), Math.round(bb.top), Math.round(bb.right), Math.round(bb.bottom)]);    
                }
            }
                
            // }
        }
        return listOfObjects
    }

    getTextBoundingBoxes = function(max_width){
        var listOfObjects = [];
        console.log('searching text nodes')

        // -- FIND TEXT NODES JAVASCRIPT
        var textNodesUnder = function(el){
          var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
          while(n=walk.nextNode()) a.push(n);
          return a;
        }

        text_nodes = textNodesUnder(document.body)
        
        //range 
        var range = document.createRange();

        for (i = 0; i < text_nodes.length; i++) {
            textNode = text_nodes[i]
         
            // range init was here    
            range.selectNodeContents(textNode);
            bb = range.getBoundingClientRect()
            str = textNode.nodeValue

            // save only if
            // parent is not hidden, it is visible and text is not empty
            if (textNode.parentNode.offsetParent != null && str &&
                window.getComputedStyle(textNode.parentNode).visibility == 'visible'){
                // if it has some size
                if(bb.width>0 && bb.height>0){ 
                    // and it is in our bounds
                    if(bb.left>=0 && bb.top >=0 && bb.right <= max_width){
                        str = ''+str.replace(/ +(?= )/g,'') //replace multiple spaces
                        str = str.replace(/(\r\n|\n|\r)/gm,' '); // remove newlines
                        str = str.trim();    //trim
                        obj = {text: str, boundingBox: [Math.round(bb.left), Math.round(bb.top), Math.round(bb.right), Math.round(bb.bottom)]};
                        listOfObjects.push(obj);    
                    }
                }
            }
        }
        return listOfObjects
    }

    // function - render next url
    retrieve = function() {
        var url;
        if (urls.length > 0) {
            url = urls.shift();
            // urlIndex++;
            
            page = webpage.create();
            page.viewportSize = {
                width: MAX_WIDTH,
                height: 1000
            };

            page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.0.0 Safari/538.1; CVUT-Cloud_Computing_Center BOT (http://3c.felk.cvut.cz/bot/)"
            page.onConsoleMessage = function(msg) {
              console.log(msg);
            };

            return page.open(url, function(status) {
                var file;
                image_path = getImagePath(prefix,urlIndex);
                image_filename = getImageFilename(prefix,urlIndex);
                annotation_path = getAnnotationPath(prefix,urlIndex);
                list_path = getListPath(prefix);

                //succeded
                if (status === "success") {

                    //after 200 ms - press ESCAPE
                    window.setTimeout((function() {
                        page.sendEvent('keypress', page.event.key.Escape);
                    }), 400);

                     //after 300 ms - start parsing and rendering
                    return window.setTimeout((function() {
                        //--- FIND INTERESTING TYPED OBJECTS AND SAVE TO LIST
                        var typedObjects = [];   
                        var name = page.evaluate(getElementByXpath,xpaths["name"],MAX_WIDTH);
                        var price = page.evaluate(getElementByXpath,xpaths["price"],MAX_WIDTH);
                        var main_image = page.evaluate(getElementByXpath,xpaths["main_image"],MAX_WIDTH);
                        // var short_text = page.evaluate(getElementByXpath,xpaths["short_text"],MAX_WIDTH);

                        //--- if everything was detected properly
                        if(name && price && main_image){
                            //add url index
                            urlIndex++;

                            name["type"] = "name";
                            price["type"] = "price";
                            main_image["type"] = "main_image";
                            // short_text["type"] = "short_text";

                            typedObjects.push(name);
                            typedObjects.push(price);
                            typedObjects.push(main_image);
                            // typedObjects.push(short_text);

                            var visibleBBs = page.evaluate(getVisibleBoundingBoxes,MAX_WIDTH);
                            var textBBs = page.evaluate(getTextBoundingBoxes,MAX_WIDTH);

                            page.render(image_path,{format: 'jpeg', quality: '100'});

                            return next(status, url, image_filename, annotation_path, list_path, typedObjects, visibleBBs, textBBs);

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
                            // if (!short_text){
                            //     console.log("Error: "+url+" - missing short_text");
                            // }
                            next("parsing_error", url, file, null, null, null);
                        }
                    }), 600);
                } 
                // not succeded
                else {
                    return next(status, url, image_filename, annotation_path, list_path,null, null);
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
callbackPerUrl = function(status, url, imageFilename, annotationPath, listPath, typedObjects, visibleBBs, textBBs) {
    // Save only succesful renders
    if (status === "success"){
        console.log(url);

        var object = {
            url:  url,
            image: imageFilename,
            typedObjects: typedObjects,
            visibleBB: visibleBBs
            textBB: textBBs
        };

        // if does not exist, start array
        if (!fs.exists(listPath)){
            fs.write(listPath, imageFilename, 'w+');
        }else{
            fs.write(listPath, "\n"+imageFilename, 'w+');
        }

        // write json object
        var content = JSON.stringify(object);
            fs.write(annotationPath, content, 'w+');
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
    // fs.write(output_path, "]", 'w+');
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
if (system.args.length == 4) {
    var input_path = system.args[1];
    var xpath_rules = system.args[2];
    // var output_path = system.args[3];
    var prefix = system.args[3];
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
RenderUrlsToFile(arrayOfUrls, prefix ,callbackPerUrl, callbackFinal);
