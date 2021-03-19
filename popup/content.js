console.log('hello');

addNewText = (text) => {
    const url = window.location.href.toString()
    chrome.storage.local.get([url], function (result) {
        console.log(result);
        var previousValues = result[url] || []
        previousValues.push(text)
        chrome.storage.local.set({ [url]: previousValues }, function () {
            console.log(previousValues.toString() + ' is added');
            // chrome.browserAction.setPopup({ popup: "popup/popup.html" });
        });
    });
}
deleteText = (text, callback) => {
    const url = window.location.href.toString()
    chrome.storage.local.get([url], function (result) {
        var previousValues = result[url] || []
        previousValues = previousValues.filter((value) => { return (value.selectionText != text) })
        chrome.storage.local.set({ [url]: previousValues }, function () {
            console.log(previousValues.toString() + ' is deleted');
            // chrome.browserAction.setPopup({ popup: "popup/popup.html" });
            callback()
        });
    });
}

document.addEventListener('keydown', (e) => {

    if (e.ctrlKey && String.fromCharCode(e.keyCode).toLowerCase() === 's') {
        let selectionText = getHTMLOfSelection()
        let raw = getHTMLOfSelection()
        if (!selectionText.includes("<table")) {
            selectionText = window.getSelection().toString()
        }
        let offset = {
            x: scrollX,
            y: scrollY
        }
        if (selectionText) {
            alert(selectionText)
            const selection = {
                selectionText,
                raw,
                offset
            }
            addNewText(selection)
        } else {
            alert("Please select text")
        }
        e.preventDefault();
        e.stopPropagation();
        // Do some stuff...
    }
})
function getHTMLOfSelection() {
    var range;
    if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        return range.htmlText;
    }
    else if (window.getSelection) {
        var selection = window.getSelection()
        const temp = selection.toString().trim().split(" ")
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            var clonedSelection = range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(clonedSelection);
            const result = div.innerHTML.toString()
            return result
        }
        else {
            return '';
        }
    }
    else {
        return '';
    }
}
findInDom = (text, selection) => {
    console.log(text, selection)
    if (typeof (selection) == "string") {
        selection = JSON.parse(selection)
    }
    var src_str = document.getElementsByTagName("body")[0].innerHTML;
    src_str = src_str.replace(`<mark id="note-mark">`, "")
    src_str = src_str.replace(`</mark>`, "")
    src_str = src_str.replace(text, `<mark id="note-mark">${text}</mark>`)

    console.log(src_str)
    // var pattern = new RegExp("(" + text + ")", "gi");

    // src_str = src_str.replace(pattern, "<mark>$1</mark>");
    //src_str = src_str.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4");

    document.getElementsByTagName("body")[0].innerHTML = (src_str);
    const href = "#note-mark"
    let offsetTop = document.querySelector(href)?.offsetTop - 100 || undefined;
    if (!offsetTop && selection) {
        offsetTop = selection.offset.y
    }
    console.log(offsetTop)
    scroll({
        top: offsetTop,
        behavior: "smooth"
    });
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
        else if (request.greeting == "search") {
            console.log(request.selection)
            const url = window.location.href.toString()
            if (request.selection.url && request.selection.url != url) {

            } else {
                const raw = request.selection.raw
                findInDom(raw, request.selection)
                // window.find(request.selection)
                sendResponse({ farewell: "ok" });
            }
        }
        else if (request.greeting == "delete") {
            sendResponse({ farewell: "wait" })
            deleteText(request.selection.selectionText, () => { sendResponse({ farewell: "ok" }); })
            console.log("delete", request.selection)
        }
    }
);