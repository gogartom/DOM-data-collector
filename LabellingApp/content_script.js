var $target;    // where the mouse is
var $marked;


// ####### INIT MESSAGING ##########
var messageSource, messageOrigin;

// receive message
addEventListener('message', function(e) {
    
    // if we should initiate messaging with parent
    if (!messageSource && e.data == "initial message from chrome app") {
        messageSource = e.source;
        messageOrigin = e.origin;
    } 

    //if radio changed
    if(e.data.substr(0, 13) == "radio_button_"){
        var xpath = e.data.replace('radio_button_','');

        var result = $.xpath(xpath);
        markNewElement(result);
        sendMessage("other",xpath);
    }
    // sendMessage("other",e.data);
});

// send message
function sendMessage(type,value){
    var pass_data = {
        'type':type,
        'value':value
    };
    // messageSource.postMessage(message, messageOrigin);
    messageSource.postMessage(JSON.stringify(pass_data), messageOrigin);
}

// ####### GET TEXT OF ELEMENT ##########
// http://stackoverflow.com/questions/7382400/need-jquery-text-function-to-ignore-hidden-elements
// http://stackoverflow.com/questions/2351278/css-javascript-get-user-visible-text-of-an-element

function getElementText(element){
    //--- cloned version does not work
    // var clone = element.clone();
    // clone.find('*').not(':visible').remove();
    // return clone.text()

    //--- delete in place
    element.find('*').not(':visible').remove();
    return element.text()
}


// ####### XPATH ##########

function getXPathsToElement(el){
    var paths = [];
    // var parent_paths;

    //get path to parent
    var parent = el.parentNode;
    // we have parent
    if (parent && parent.nodeType == 1){
        parent_paths = getXPathsToElement(parent);
    }
    // we don't have parent
    else{
        parent_paths = []
        parent_paths.push("");
    }

    // zjisti jestli ma id
    var unique_id;
    var allNodes = document.getElementsByTagName('*'); 
    if(el.hasAttribute('id')){
        // zjisti jestli ma unikatni id
        var uniqueIdCount = 0;

        // prochazi elementy a hleda stejne id
        for (var n=0;n < allNodes.length;n++) { 
            if (allNodes[n].hasAttribute('id') && allNodes[n].id == el.id) uniqueIdCount++; 
            if (uniqueIdCount > 1) break; 
        }

        // je jen jedno takove id
        if ( uniqueIdCount == 1) { 
            unique_id = el.getAttribute('id');
        }
    }

    // standard path from parent
    var i;
    for (i = 1, sib = el.previousSibling; sib; sib = sib.previousSibling) { 
        if (sib.localName == el.localName)  i++; 
    }

    var path_from_parent = el.localName.toLowerCase() + '[' + i + ']';

    // //----- add to paths -----
    for (i=0;i<parent_paths.length;i++){
        paths.push(parent_paths[i]+"/"+path_from_parent);
    }

    // add id
    if(unique_id){
        paths.push('id("'+unique_id+'")');
    }
    return paths;
}


function createXPathFromElement(elm) { 
    var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    { 
        if (elm.hasAttribute('id')) { 
                var uniqueIdCount = 0; 
                for (var n=0;n < allNodes.length;n++) { 
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                    if (uniqueIdCount > 1) break; 
                }; 
                if ( uniqueIdCount == 1) { 
                    segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                    return segs.join('/'); 
                } else { 
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                } 
        } else if (elm.hasAttribute('class')) { 
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
        } else { 
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == elm.localName)  i++; }; 
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
        }; 
    }; 
    return segs.length ? '/' + segs.join('/') : null; 
}; 

/**
 * Gets an XPath for an element which describes its hierarchical location.
 */
function getElementXPath(element)
{
    if (element && element.id)
        return '//*[@id="' + element.id + '"]';
    else
        return this.getElementTreeXPath(element);
};

function getElementTreeXPath(element)
{
    var paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var index = 0;
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
        {
            // Ignore document type declaration.
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

            if (sibling.nodeName == element.nodeName)
                ++index;
        }

        var tagName = element.nodeName.toLowerCase();
        var pathIndex = (index ? "[" + (index+1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }

    return paths.length ? "/" + paths.join("/") : null;
};

// ####### MOUSE CLICK ##########

document.addEventListener('click',function(e) {
    
    e.stopPropagation();
    e.preventDefault();

    // mark element
    markNewElement($target);

    // send message with information
    sendMessage('clicked_text',getElementText($target)); 
    sendMessage('clicked_path', getXPathsToElement($target.get(0)));   
    return true;
},true);



// ####### ADDING ELEMENTS ##########



// adding selector
$("<style type='text/css'> #selector-top, #selector-bottom { background: #F0611A; z-index: 1000; height:4px; position: fixed; transition:all 300ms ease; } #selector-left, #selector-right { background: #F0611A; z-index: 1000; width:4px; position: fixed; transition:all 300ms ease; } .n{ -webkit-transform: scale(3) translateX(100px) } </style>").appendTo("head");
$("<div id='selector'> <div id='selector-top'></div> <div id='selector-left'></div> <div id='selector-right'></div> <div id='selector-bottom'></div> </div>").appendTo("body");
$('body').css( 'cursor', 'pointer' );

var  elements = {
    top: $('#selector-top'),
    left: $('#selector-left'),
    right: $('#selector-right'),
    bottom: $('#selector-bottom')
};

// adding clicked marker
// $("<style type='text/css'> #marker{ background-color: rgba(51, 153, 255,0.2); -webkit-box-shadow:inset 0px 0px 0px 3px rgba(51, 153, 255,0.6); z-index: 1000; position: absolute} </style>").appendTo("head");
// $("<div id='marker'/>").appendTo("body");

//border-style: solid; border-width: 4px; border-color: rgb(51, 153, 255);
   
  
// ####### MOUSE MOVE ##########

$(document).mousemove(function(event) {
    if(event.target.id.indexOf('selector') !== -1 || event.target.tagName === 'BODY' || event.target.tagName === 'HTML' ) return; 
    
    $target = $(event.target);
        targetOffset = $target[0].getBoundingClientRect(),
        targetHeight = targetOffset.height,
        targetWidth  = targetOffset.width;
    
    sendMessage('text',getElementText($target)); 
    sendMessage('path', getElementTreeXPath($target.get(0)));

    elements.top.css({
        left:  (targetOffset.left - 4),
        top:   (targetOffset.top - 4),
        width: (targetWidth + 5)
    });
    elements.bottom.css({
        top:   (targetOffset.top + targetHeight ),
        left:  (targetOffset.left  - 3),
        width: (targetWidth + 4)
    });
    elements.left.css({
        left:   (targetOffset.left  - 4),
        top:    (targetOffset.top  - 4),
        height: (targetHeight + 8)
    });
    elements.right.css({
        left:   (targetOffset.left + targetWidth ),
        top:    (targetOffset.top  - 4),
        height: (targetHeight + 8)
    });
});

// ####### OTHER FUNCTIONS ##########

// add xpath selector to jquery
(function($) {
    $.xpath = function(exp, ctxt) {
        var item, coll = [],
            result = document.evaluate(exp, ctxt || document, null, 5, null);

        while (item = result.iterateNext())
            coll.push(item);

        return $(coll);
    }
})(jQuery);

function markNewElement(e){

    // targetOffset = e[0].getBoundingClientRect();

    // $('#marker').css({
    //     left:  targetOffset.left,
    //     top:   targetOffset.top,
    //     width: targetOffset.width,
    //     height: targetOffset.height
    // });

    // unmark the old one
    if($marked){

        // $marked.css({"box-shadow": "0px 0px 0px 0px rgb(51, 153, 255) inset"});
        $marked.css({"background-color": "rgba(51, 153, 255,0.0)"});
        $marked.css({"outline": "0px solid rgba(51, 153, 255,0.0)"});
    }

    // mark new target
    $marked = e;   

    // e.css({"-webkit-box-shadow": "inset 0px 0px 0px 3px rgba(51, 153, 255,0.6)"});
    e.css({"outline": "3px solid rgba(51, 153, 255,0.9)"});
    e.css({"outline-offset": "-3px"});

    e.css({"background-color": "rgba(51, 153, 255,0.4)"});
}