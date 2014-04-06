(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// normally you would just 'npm install grande-module' and
// require('grande-module')
var grande = require('../src/js/grande-module.js');

var article = document.createElement('article');

// provide omitted tags as a comma separated string
grande.bind(article,null,"h3,h4,h5");
document.body.appendChild(article);

var buttons = document.createElement('div');
buttons.className = 'example-buttons';

var rebindBtn = document.createElement('button');
rebindBtn.textContent = "Rebind";
rebindBtn.disabled = true;
buttons.appendChild(rebindBtn);
rebindBtn.addEventListener('click',function(){
	//this time do not omit any tags
	grande.bind(article);
	rebindBtn.disabled = true;
	disposeBtn.disabled = false;
});

var disposeBtn = document.createElement('button');
disposeBtn.textContent = "Dispose";
buttons.appendChild(disposeBtn);
disposeBtn.addEventListener('click',function(){
	grande.dispose();
	disposeBtn.disabled = true;
	rebindBtn.disabled = false;
});

document.body.appendChild(buttons);
},{"../src/js/grande-module.js":2}],2:[function(require,module,exports){
function Grande() {

  var EDGE = -999;
      menuButtonWidth = 30;

  var root = window,
    document = window.document,
    article = null,
    isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    options = {
      animate: true
    },
    textMenu,
    optionsNode,
    urlInput,
    previouslySelectedText,
    omittedTags = [],

    grande = {
      bind: function(bindableElement, opts, omitTags) {

        if (!bindableElement) {
          throw new Error("Please provide a proper element that can be bound to grande.");
        }

        if (omitTags) {
          omittedTags = omitTags.split(',');
        } else {
          omittedTags.length = 0;
        }

        article = bindableElement;

        attachToolbarTemplate();
        bindTextSelectionEvents(article);
        bindTextStylingEvents();

        options = opts || options;
      },
      dispose: function() {
        disposeEverything();
      },
      select: function() {
        triggerTextSelection();
      }
    },

    tagClassMap = {
      "b": "bold",
      "i": "italic",
      "h1": "header1",
      "h2": "header2",
      "h3": "header3",
      "h4": "header4",
      "h5": "header5",
      "a": "url",
      "blockquote": "quote"
    };

  function attachToolbarTemplate() {
    var div = document.createElement("div"),
        toolbarTemplate = "<div class='options'> \
          <span class='no-overflow'> \
            <span class='ui-inputs'> \
              <button class='bold'>B</button> \
              <button class='italic'>i</button> \
              <button class='header1'>h1</button> \
              <button class='header2'>h2</button> \
              <button class='header3'>h3</button> \
              <button class='header4'>h4</button> \
              <button class='header5'>h5</button> \
              <button class='quote'>&rdquo;</button> \
              <button class='url'>&#xe001;</button> \
              <input class='url-input' type='text' placeholder='Paste or type a link'/> \
            </span> \
          </span> \
        </div>";

    div.className = "grande-text-menu hide";
    div.innerHTML = toolbarTemplate;

    if (document.querySelectorAll(".grande-text-menu").length === 0) {
      document.body.appendChild(div);
    }

    textMenu = document.querySelectorAll(".grande-text-menu")[0];
    optionsNode = document.querySelectorAll(".grande-text-menu .options")[0];
    urlInput = document.querySelectorAll(".grande-text-menu .url-input")[0];
  }

  function bindTextSelectionEvents(node) {
    var i,
        len

    document.addEventListener('mouseup', documentMouseUpHandler, false);

    // Handle window resize events
    root.addEventListener('resize', triggerTextSelection);

    urlInput.addEventListener('blur', triggerUrlBlur, false);
    urlInput.addEventListener('keydown', triggerUrlSet, false);

    node.contentEditable = true;
    
    // Trigger on both mousedown and mouseup so that the click on the menu
    // feels more instantaneously active
    node.addEventListener('mousedown', triggerTextSelection, false);
    node.addEventListener('mouseup', articleMouseUpHandler, false);

    node.addEventListener('keydown', preprocessKeyDown, false);
    node.addEventListener('keyup', articleKeyUpHandler, false);
    node.addEventListener('paste', preprocessPaste, false);

  }

  function disposeEverything() {

    var node = article;

    document.removeEventListener('mouseup', documentMouseUpHandler, false);
    root.removeEventListener('resize', triggerTextSelection, false);

    urlInput.removeEventListener('blur', triggerUrlBlur, false);
    urlInput.removeEventListener('keydown', triggerUrlSet, false);

    node.removeEventListener('mousedown', triggerTextSelection, false);
    node.removeEventListener('mouseup', articleMouseUpHandler, false);
    node.removeEventListener('keydown', preprocessKeyDown, false);
    node.removeEventListener('keyup', articleKeyUpHandler, false);
    node.removeEventListener('paste', preprocessPaste, false);
    node.contentEditable = false;

    iterateTextMenuButtons(function(iteratedNode) {
      node.removeEventListener('mousedown', function(event) {
        triggerTextStyling(iteratedNode);
      }, false);
    });

    textMenu.parentNode.removeChild(textMenu);
    
  }

  function documentMouseUpHandler(event) {
    setTimeout(function() {
      triggerTextSelection(event);
    },1);
  }

  function articleMouseUpHandler(event) {
    setTimeout(function() {
      triggerTextSelection(event);
    }, 1);

    //check if the article is empty
    if (article.children.length === 0) {
      createEmptyParagraph();
    }
  }

  function createEmptyParagraph() {
    var p = document.createElement('p');
    var br = document.createElement('br');
    p.appendChild(br);
    article.appendChild(p);
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(p,0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function articleKeyUpHandler(event) {
    var sel = window.getSelection();

    // FF will return sel.anchorNode to be the parentNode when the triggered keyCode is 13
    if (sel.anchorNode && sel.anchorNode.nodeName !== "ARTICLE") {
      triggerNodeAnalysis(event);

      if (sel.isCollapsed) {
        triggerTextParse(event);
      }
    }

    //check if the article is empty after deletion
    if (article.children.length === 0) {
      createEmptyParagraph();
    }
  }

  function iterateTextMenuButtons(callback) {
    var textMenuButtons = document.querySelectorAll(".grande-text-menu button"),
        i,
        len,
        node;

    for (i = 0, len = textMenuButtons.length; i < len; i++) {
      node = textMenuButtons[i];

      (function(n) {
        callback(n);
      })(node);
    }
  }

  function textMenuButtonMouseDownHandler(event) {

  }

  function bindTextStylingEvents() {

    var omittedClassNames = []; 
    var numButtons = 0;

    for (var i = 0; i < omittedTags.length; i++) {
      omittedClassNames.push(tagClassMap[omittedTags[i]]);
    }

    iterateTextMenuButtons(function(node) {
      if (omittedClassNames.indexOf(node.className) !== -1) {
        node.parentNode.removeChild(node);
      }
      else {
        node.addEventListener('mousedown', function(event) {
          triggerTextStyling(node);
        }, false);
        numButtons++;
      }

    });

    textMenu.style.width = (numButtons * menuButtonWidth) + 'px';
    textMenu.style.marginLeft = (numButtons * menuButtonWidth) / -2 + 'px';
    optionsNode.style.width = (numButtons * menuButtonWidth) + 'px';
  }

  function getFocusNode() {
    return root.getSelection().focusNode;
  }

  function reloadMenuState() {
    var className,
        focusNode = getFocusNode(),
        tagClass,
        reTag;

    iterateTextMenuButtons(function(node) {
      className = node.className;

      //disable bold in headings to get rid of inline styling
      if (/bold/.test(className) && hasParentHeadingTag(focusNode)) {
        node.className = "bold locked";
      } 

      else {

        for (var tag in tagClassMap) {
          tagClass = tagClassMap[tag];
          reTag = new RegExp(tagClass);

          if (reTag.test(className)) {

            if (hasParentWithTag(focusNode, tag)) {
              node.className = tagClass + " active";
            } 
            else {
              node.className = tagClass;
            }

            break;
          }

        }
      }
      
    });
  }

  function preprocessPaste(event) {
    
    event.preventDefault();

    var sel = window.getSelection(),
        range = document.createRange(),
        offset = sel.extentOffset,
        parentNode = sel.anchorNode.parentNode,
        rangeContainer = sel.getRangeAt(0).startContainer,
        p,
        pastedText = undefined;

    //get clipboard data
    if (window.clipboardData && window.clipboardData.getData) { // IE
      pastedText = window.clipboardData.getData('Text');
    } else if (event.clipboardData && event.clipboardData.getData) {
      pastedText = event.clipboardData.getData('text/plain');
    }

    //insert pasted text to caret position
    var pt1 = rangeContainer.textContent.substr(0,offset);
    var pt2 = rangeContainer.textContent.substr(offset);
    rangeContainer.textContent = pt1 + pastedText + pt2;

    //if container is an empty dom element, set container as its' first child (the pasted text)
    if (rangeContainer.nodeType === 1) {
      rangeContainer = rangeContainer.firstChild;
    }

    //reposition caret to the end of pasted text
    range.setStart(rangeContainer, offset + pastedText.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

  }

  function preprocessKeyDown(event) {
    var sel = window.getSelection(),
        parentParagraph = getParentWithTag(sel.anchorNode, "p"),
        p,
        prevSibling,
        isHr;

    if (event.keyCode === 13 && parentParagraph) {
      prevSibling = parentParagraph.previousSibling;
      isHr = prevSibling && prevSibling.nodeName === "HR" &&
        !parentParagraph.textContent.length;

      // Stop enters from creating another <p> after a <hr> on enter
      if (isHr) {
        event.preventDefault();
        if (getParentWithTag(sel.anchorNode,'blockquote')) {
          prevSibling.parentNode.removeChild(prevSibling);
          document.execCommand('outdent');
        }
      }

    }

    if (event.keyCode === 8 || event.keyCode === 46) {
      if (getParentWithTag(sel.anchorNode,'blockquote')) {
      }
      var parentH1 = getParentWithTag(sel.anchorNode, 'h1');
      var parentH2 = getParentWithTag(sel.anchorNode, 'h2');

      if (parentH1 || parentH2) {
        var parentHeader = parentH1 || parentH2;
        removeDefaultFormatting(parentHeader);

        if (parentHeader.previousElementSibling && (/OL|UL|BLOCKQUOTE/).test(parentHeader.previousElementSibling.nodeName)) {
          
          setTimeout(function(){
            var wrappingNode = getParentWithTag(sel.anchorNode, 'li') || getParentWithTag(sel.anchorNode, 'p') || getParentWithTag(sel.anchorNode, 'blockquote');
            removeDefaultFormatting(wrappingNode);
          },1);
        }
      }

    }
  }

  function triggerNodeAnalysis(event) {
    var sel = window.getSelection(),
        anchorNode,
        parentParagraph;

    if (event.keyCode === 13) {

      // Enters should replace it's parent <div> with a <p>
      if (sel.anchorNode.nodeName === "DIV") {
        toggleFormatBlock("p");
      }

      parentParagraph = getParentWithTag(sel.anchorNode, "p");

      if (parentParagraph) {
        insertHorizontalRule(parentParagraph);
      }

      parentBlockquote = getParentWithTag(sel.anchorNode, "blockquote");

      if (parentBlockquote) {
        //prevent the creation of empty blockquotes with enter
        if (parentBlockquote.textContent.length === 0) {
          toggleFormatBlock('p');
        }
        //createEmptyParagraph();
      }

      if (parentBlockquote && parentParagraph) {
        //toggleFormatBlock('blockquote');
      }
    }

  }

  function insertHorizontalRule(parentParagraph) {
    var prevSibling,
        prevPrevSibling,
        hr;

    prevSibling = parentParagraph.previousSibling;
    prevPrevSibling = prevSibling;
    
    while(prevPrevSibling = prevPrevSibling.previousSibling){
      if (prevPrevSibling.nodeType != Node.TEXT_NODE) break;
    }

    if (!prevPrevSibling) {
      return;
    }

    if (prevSibling.nodeName === "P" && !prevSibling.textContent.length && prevPrevSibling.nodeName !== "HR") {
      hr = document.createElement("hr");
      hr.contentEditable = false;
      parentParagraph.parentNode.replaceChild(hr, prevSibling);
    }
  }

  function getTextProp(el) {
    var textProp;

    if (el.nodeType === Node.TEXT_NODE) {
      textProp = "data";
    } else if (isFirefox) {
      textProp = "textContent";
    } else {
      textProp = "innerText";
    }

    return textProp;
  }

  function insertListOnSelection(sel, textProp, listType) {
    var execListCommand = listType === "ol" ? "insertOrderedList" : "insertUnorderedList",
        nodeOffset = listType === "ol" ? 3 : 2;

    document.execCommand(execListCommand);
    sel.anchorNode[textProp] = sel.anchorNode[textProp].substring(nodeOffset);

    return getParentWithTag(sel.anchorNode, listType);
  }

  function triggerTextParse(event) {
    var sel = window.getSelection(),
        textProp,
        subject,
        insertedNode,
        unwrap,
        wasMerged,
        node,
        parent,
        range;

    // FF will return sel.anchorNode to be the parentNode when the triggered keyCode is 13
    if (!sel.isCollapsed || !sel.anchorNode || sel.anchorNode.nodeName === "ARTICLE") {
      return;
    }

    textProp = getTextProp(sel.anchorNode);
    subject = sel.anchorNode[textProp];

    if (subject.match(/^-\s/) && sel.anchorNode.parentNode.nodeName !== "LI") {
      insertedNode = insertListOnSelection(sel, textProp, "ul");
    }

    if (subject.match(/^1\.\s/) && sel.anchorNode.parentNode.nodeName !== "LI") {
      insertedNode = insertListOnSelection(sel, textProp, "ol");
    }

    if (!insertedNode) {return;}

    unwrap = insertedNode &&
            ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 &&
            ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0 ||
            ["h1", "h2", "h3", "h4", "h5"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0;

    if (unwrap) {
      node = sel.anchorNode;
      parent = insertedNode.parentNode;
      parent.parentNode.insertBefore(insertedNode, parent);
      parent.parentNode.removeChild(parent);
      removeDefaultFormatting(getParentWithTag(node,'li'));
      moveCursorToBeginningOfSelection(sel, node);
    }

    wasMerged = (insertedNode.parentNode.nodeName === "ARTICLE");

    if (wasMerged) {
      removeDefaultFormatting(getParentWithTag(sel.focusNode,'li'));
    }
  }

  function removeDefaultFormatting(wrappingNode) {
    var children = wrappingNode.childNodes;
    if (wrappingNode) {
      for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        //remove styles left behind in element nodes
        if (child.nodeType === 1) {
          child.removeAttribute("style"); 
        }
        //remove spans we don't need
        if (child.nodeName.toLowerCase() === "span") {
          wrappingNode.insertBefore(child.childNodes[0],child);
          wrappingNode.removeChild(child);
        } 
      }
      //remove the last linebreak if present
      if (wrappingNode.lastChild.nodeName.toLowerCase() === "br") {
        wrappingNode.removeChild(wrappingNode.lastChild);
      }
    }
  }

  function moveCursorToBeginningOfSelection(selection, node) {
    range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function triggerTextStyling(node) {
    var className = node.className,
        sel = window.getSelection(),
        selNode = sel.anchorNode,
        tagClass,
        reTag;

    //do nothing if locked
    if (/locked/.test(className)) {
      return;
    }

    for (var tag in tagClassMap) {
      tagClass = tagClassMap[tag];
      reTag = new RegExp(tagClass);

      if (reTag.test(className)) {
        switch(tag) {
          case "b":
            //stop inline styling in headings (<span style="font-weight:normal">)
            if (selNode && !hasParentHeadingTag(selNode)) {
              document.execCommand(tagClass, false);
            }
            return;
          case "i":
            document.execCommand(tagClass, false);
            return;

          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "blockquote":
            toggleFormatBlock(tag);
            return;

          case "a":
            toggleUrlInput();
            optionsNode.className = "options url-mode";
            return;
        }
      }
    }

    triggerTextSelection();
  }

  function triggerUrlBlur(event) {
    var url = urlInput.value;

    optionsNode.className = "options";
    window.getSelection().addRange(previouslySelectedText);

    document.execCommand("unlink", false);

    if (url === "") {
      return false;
    }

    if (!url.match("^(http://|https://|mailto:)")) {
      url = "http://" + url;
    }

    document.execCommand("createLink", false, url);

    urlInput.value = "";
  }

  function triggerUrlSet(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      urlInput.blur();
    }
  }

  function toggleFormatBlock(tag) {

    //heading tags
    if (isHeadingTag(tag)) {
      
      var anchor = window.getSelection().anchorNode;
      
      //strip bold and italic if they wrappin' selection
      if (anchor.parentNode.nodeName === "B") {
        document.execCommand("bold");
      } else if (anchor.parentNode.nodeName === "I") {
        document.execCommand("italic");
      }
      
      //headings in lists
      if (hasParentWithTag(getFocusNode(),'li')) {
        document.execCommand("formatBlock",false,tag);
        document.execCommand("outdent");
        removeDefaultFormatting( getParentHeading(window.getSelection().focusNode) );
      }
      //headings in blockquotes
      else if (hasParentWithTag(getFocusNode(),'blockquote')) {
        if (hasParentWithTag(getFocusNode(), tag)) {
          document.execCommand("formatBlock", false, "p");
        } else {
          document.execCommand("formatBlock",false,tag);
          removeDefaultFormatting( getParentHeading(window.getSelection().focusNode) );
        }
      }
      // is the same heading tag
      else if (hasParentWithTag(getFocusNode(), tag)) {
        document.execCommand("formatBlock",false,'p');
      }
      // is different heading tag
      else {
        document.execCommand("formatBlock",false,tag);
      }
      
    }
    else if (tag === 'blockquote') {
      if (hasParentWithTag(getFocusNode(), tag)) {

        document.execCommand("formatBlock", false, 'p');
        return;

        var bq = getParentWithTag(getFocusNode(), 'blockquote');
        bq.outerHTML = bq.innerHTML;

        document.createElement('p');
        p.innerHTML = bq.outerHTML;

        article.inserBefore(p,bq);
        article.removeChild(bq);

      } else {
        document.execCommand("formatBlock", false, tag);
      }
    }
    //basic block toggler
    else {
      if (hasParentWithTag(getFocusNode(), tag)) {
        document.execCommand("formatBlock", false, "p");
        document.execCommand("outdent");
      } else {
        document.execCommand("formatBlock", false, tag);
      }
    }

  }

  function toggleUrlInput() {
    setTimeout(function() {
      var url = getParentHref(getFocusNode());

      if (typeof url !== "undefined") {
        urlInput.value = url;
      } else {
        document.execCommand("createLink", false, "/");
      }

      previouslySelectedText = window.getSelection().getRangeAt(0);

      urlInput.focus();
    }, 150);
  }

  function getParent(node, condition, returnCallback) {
    while (node.parentNode) {
      if (condition(node)) {
        return returnCallback(node);
      }

      node = node.parentNode;
    }
  }

  function getParentHeading(node) {
    var checkNodeType = function(node) { return  isHeadingTag(node.nodeName.toLowerCase()); },
        returnNode = function(node) { return node; };

    return getParent(node, checkNodeType, returnNode);
  }

  function getParentWithTag(node, nodeType) {
    var checkNodeType = function(node) { return node.nodeName.toLowerCase() === nodeType; },
        returnNode = function(node) { return node; };

    return getParent(node, checkNodeType, returnNode);
  }

  function hasParentWithTag(node, nodeType) {
    return !!getParentWithTag(node, nodeType);
  }

  function hasParentHeadingTag(node) {
    
    var hasParentHeading =  !!getParentWithTag(node, 'h1') ||
                            !!getParentWithTag(node, 'h2') ||
                            !!getParentWithTag(node, 'h3') ||
                            !!getParentWithTag(node, 'h4') ||
                            !!getParentWithTag(node, 'h5');

    return hasParentHeading;

  }

  function isHeadingTag(tag) {
    return /h1|h2|h3|h4|h5/.test(tag);
  }

  function getParentHref(node) {
    var checkHref = function(node) { return typeof node.href !== "undefined"; },
        returnHref = function(node) { return node.href; };

    return getParent(node, checkHref, returnHref);
  }

  function triggerTextSelection() {
      var selectedText = root.getSelection(),
          range,
          clientRectBounds;

      // The selected text is collapsed, push the menu out of the way
      if (selectedText.isCollapsed) {
        setTextMenuPosition(EDGE, EDGE);
        textMenu.className = "grande-text-menu hide";
      } else {
        range = selectedText.getRangeAt(0);
        clientRectBounds = range.getBoundingClientRect();

        // Every time we show the menu, reload the state
        reloadMenuState();
        setTextMenuPosition(
          clientRectBounds.top - 5 + root.pageYOffset,
          (clientRectBounds.left + clientRectBounds.right) / 2
        );
      }
  }

  function setTextMenuPosition(top, left) {
    textMenu.style.top = top + "px";
    textMenu.style.left = left + "px";

    if (options.animate) {
      if (top === EDGE) {
        textMenu.className = "grande-text-menu hide";
      } else {
        textMenu.className = "grande-text-menu active";
      }
    }
  }

  return grande;

}

module.exports = Grande();
},{}]},{},[1])