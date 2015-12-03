// ######################################
// ######       VARIABLES          ######
// ######################################

var urls;
var current = -1;
var xpaths = {};
var all_xpaths = [];

// ######################################
// ######     INITIALIZATION       ######
// ######################################

// vezme webview
var wv = document.querySelector('webview');

// nastavi listener na loadcommit
wv.addEventListener('loadcommit', function(e) {
    //pouze na první load
    if(e.isTopLevel == true){
           initWebView();
    }
});

function initWebView(){
    //spusti jquery
    wv.executeScript({ file: "jquery.js" }, function() {
        // spusti content script
        wv.executeScript({ file: "content_script.js" }, function(){
            // inicializace komunikace
            initWebViewCommunication();    
        }); 
    });
}


function initWebViewCommunication(){
    // processMessage posloucha
    addEventListener('message', processMessage); 

    // Initialize komunikace -> posilam prvni zpravu
    wv.contentWindow.postMessage('initial message from chrome app', '*');
}

// ######################################
// ###########   MESSAGING    ###########
// ######################################


function processMessage(e){
    // Zpracovavam pouze zpravy z wv.contentWindow
    if (e.source != wv.contentWindow) return;
    
    // Handle e.data however you want.
    // $("#val").html(e.data);
     var pass_data = JSON.parse(e.data);

    switch(pass_data.type) {
        case "text":
            str = ''+pass_data.value.replace(/ +(?= )/g,'') //replace multiple spaces
            str = str.replace(/(\r\n|\n|\r)/gm,' '); // remove newlines
            str = str.trim();    //trim
            $("#visible_text").html(str);
            break;
        case "path":
            $("#path").html(pass_data.value);
            break;
        case "clicked_path":
            processXpath(pass_data.value);
            break;
        case "clicked_text":
            processInfo("text",pass_data.value);
            break;
        case "other":
            console.log("OTHER: "+pass_data.value);
            break;
    }
}

// ####################################
// ############# BUTTONS ##############
// ####################################

// NEXT BUTTON
$('#next_bt').on('click', nextPage);

// LOAD BUTTON
$('#load_bt').on('click', function (e) {
    chrome.fileSystem.chooseEntry(
    {
         type: 'openFile', accepts:[{ extensions: ['txt']} ] 
    },loadFile);
});

// SAVE BUTTON
// $('#save_bt').on('click', save)

$('#save_bt').on('click', function (e) {

    chrome.fileSystem.chooseEntry( {
      type: 'saveFile',
      suggestedName: 'paths.txt',
      accepts: [ { description: 'Text files (*.txt)',
                   extensions: ['txt']} ],
      acceptsAllTypes: true
    }, writeFile);

});

// ######################################
// ############# FUNCTIONS ##############
// ######################################

// Radio button switched
$(document).ready(function() {
    $('input[type=radio][name=element]').change(function() {
        
        // change table bacground for specific element
        $(".element").css("background-color", "rgba(0,0,0,0)");
        $("#"+this.value+"_div").css("background-color", "rgba(102, 204, 255,0.15)");

        //-- send message to webview that it has changed
        var xpath_to_display;
        if(xpaths[this.value]){
            xpath_to_display = xpaths[this.value][0]
        }
        wv.contentWindow.postMessage("radio_button_"+xpath_to_display, '*');
    });
});

// process sent by click on webview
function processInfo(information_type, value){
    // show in UI
    // get selected element type
    var element_type = $('input[name=element]:checked', '#elements').val();
    var id = "#"+element_type+"_"+information_type;
    $(id).html(value);  // show
}

function processXpath(value){
    var element_type = $('input[name=element]:checked', '#elements').val();
    var id = "#"+element_type+"_xpath";
    $(id).html(value.length); 

    xpaths[element_type] = value;    
    
    console.log("saving "+element_type);
}

// change page
function nextPage(){
     //-- save data
    for (var key in xpaths) {

       // if we already have this key - just add them
       if(all_xpaths[key]){
            all_xpaths[key].push.apply(all_xpaths[key], xpaths[key]);
       }
       // if do not - add key
       else{
            all_xpaths[key] = xpaths[key]; 
       }       
    }

    //-- clear xpaths 
    xpaths = [];

    //-- switch webview if there is some other url
    if(current<urls.length-1){
        
        displayNextPage();
        
        //-- clear tables
        $(".page_value").html("");

        //-- select name
        $("#radio_name").trigger('change').prop("checked", true);
    } else{
        // save();
    }
}

function displayNextPage(){
        current = current+1;
        // switch webview
        wv.src = urls[current];
}

function processResult(){
    
    var results = [];

    // kazdy typ
    for (var key in all_xpaths) {
        
        //-- get counts
        var counts = {}
        for (var path_key in all_xpaths[key]){
            var path = all_xpaths[key][path_key];

            // get count
            var count = counts[path];
            if(!count){
                count = 0;
            }
            // add 1
            count++;
            counts[path] = count;
        }

        // get biggest count
        var max = 0;
        var paths = []
        for (var count_key in counts){
            var count = counts[count_key];

            // new maximum
            if(count>max){
                max = count;
                paths = [];
                paths.push(path);
            }
            else if(count == max){
                paths.push(path);
            }
        }

        // get shortest path
        var min_length = Number.MAX_VALUE;
        var final_path;
        for (var path_key in paths){
            var path = paths[path_key];

            if (path.length < min_length){
                min_length = path.length
                final_path = path;
            }
        }

        var res = {
            type:   key,
            xpath:  final_path,
            count: max/urls.length
        };
        console.log(key);
        results.push(res);
    }

    return results;
}

// load web pages
function loadFile(fileEntry){
    // file not chosen
    if (!fileEntry) {
        return;
    }

    // file chosen
    fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onload = processFile;
        reader.readAsText(file);
    });
};

function writeFile(fileEntry){
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      // fileWriter.onwriteend = function(e) {
      //   console.log('Write completed.');
      // };

      // fileWriter.onerror = function(e) {
      //   console.log('Write failed: ' + e.toString());
      // };

      // Create a new Blob and write it 
      
      var res = processResult();
      console.log(res);
      
      var blob = new Blob([JSON.stringify(res)]);
      fileWriter.write(blob);
  });
}

// split urls in file
function processFile(e){
    // file
    var text = e.target.result
    urls = text.split("\n");

    //display next page
    displayNextPage();
}

// ##########################################
// ############# KEY SHORTCUTS ##############
// ##########################################

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        break;

        case 38: // up
        $('input[name=element]:checked', '#elements').parent().prev().children('input').trigger('change').prop("checked", true);
        break;

        case 39: // right
        nextPage();
        break;

        case 40: // down
        $('input[name=element]:checked', '#elements').parent().next().children('input').trigger('change').prop("checked", true);
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});