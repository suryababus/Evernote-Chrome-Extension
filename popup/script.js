let url = ""
$(async function () {

    const values = await getUrlData()

    renderNotes(values)

})
function newTab(selection, newtab) {
    chrome.tabs.create({ active: false, url: selection.url }, function (tab) {
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        // make sure the status is 'complete' and it's the right tab

        if (tab.url.indexOf(selection.url) != -1 && changeInfo.status == 'complete') {
            console.log(`findInDom("${selection.raw}","${JSON.stringify(selection).replaceAll("\"", "\\\"")}");`)

            chrome.tabs.executeScript(tabId, {
                code: `findInDom("${selection.raw}","${JSON.stringify(selection).replaceAll("\"", "\\\"")}");`
            }, (result) => {
                console.log(result)
                chrome.tabs.update(tabId, { active: newtab });
            });
        }
    });
}
async function renderNotes(values) {

    var root = document.getElementById("notes-container")
    // alert("Code Executed ... ")

    root.innerHTML = ""

    values.forEach(element => {
        root.appendChild(notesContainer(element, (event) => { event.stopPropagation(); deleteText(element) }, () => { event.stopPropagation(); findInDom(element, false) }, () => { event.stopPropagation(); findInDom(element, true) }))
        root.appendChild(seperator())
    });
}
findInDom = (selection, newtab) => {
    if (selection.url && selection.url != url) {
        newTab(selection, newtab)

    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "search", selection: selection }, function (response) {

            });
        });
    }

}
deleteText = (text) => {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "delete", selection: text }, async function (response) {

            const values = await getUrlData()
            renderNotes(values)
        });
    });
}

getUrlData = () => {
    return new Promise((resolve) => {
        var query = { active: true, currentWindow: true };
        chrome.tabs.query(query, (tabs) => {
            var currentTab = tabs[0]; // there will be only one in this array

            url = currentTab.url
            chrome.storage.local.get([url], function (result) {

                var values = result[url] || []

                resolve(values)
            })
        })
    })
}
notesContainer = (selection, onDelete, onClick, onTakemethere) => {
    let message = selection.selectionText
    let note = document.createElement("div")
    note.onclick = onTakemethere
    note.className = "card card-1"
    let messagediv = document.createElement("div")
    messagediv.innerHTML = message;
    let controlWrapper = document.createElement("div")
    controlWrapper.style.padding = "10px 10px 0px";
    controlWrapper.style.display = "flex";
    controlWrapper.style.justifyContent = "space-around";

    let openinnewtab = document.createElement("div");
    openinnewtab.innerHTML = "Open in new tab"
    openinnewtab.onclick = onClick
    openinnewtab.style.color = "#ff7066"
    openinnewtab.style.cursor = "pointer"
    controlWrapper.append(openinnewtab)
    openinnewtab.style.visibility = "hidden"
    if (selection.url && selection.url != url) {
        openinnewtab.style.visibility = ""
    }

    let takeMethere = document.createElement("div");
    takeMethere.innerHTML = "Take me there"
    takeMethere.onclick = onTakemethere
    takeMethere.style.color = "#ff7066"
    takeMethere.style.cursor = "pointer"
    controlWrapper.append(takeMethere)

    let del = document.createElement("div");
    del.innerHTML = "Delete"
    del.onclick = onDelete
    del.style.color = "#ff7066"
    del.style.cursor = "pointer"
    controlWrapper.append(del)


    note.appendChild(messagediv)
    note.append(controlWrapper)
    return note
}

seperator = () => {
    let seperator = document.createElement('div')
    seperator.className = "seperator"
    return seperator
}

function search() {

    const searchKey = document.querySelector("#searchKey").value.toLowerCase()

    let result = []
    chrome.storage.local.get(null, function (items) {
        let allKeys = Object.keys(items);


        for (let x in allKeys) {
            const datas = items[allKeys[x]]

            datas.forEach(data => {

                if (data.selectionText.toLowerCase().includes(searchKey)) {
                    var searchMask = `(${searchKey})`;
                    var regEx = new RegExp(searchMask, "ig");
                    var replaceMask = `<mark>$1</mark>`;
                    data.selectionText = data.selectionText.replace(regEx, replaceMask);
                    data.url = allKeys[x]
                    result.push(data)
                }
            });
        }
        renderNotes(result)
    });

}
document.addEventListener("keypress", function (event) {

    if (event.key == "Enter")
        search()
});
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function (response) {

    });
});
// chrome.storage.sync.get(null, function(items) {
//     var allKeys = Object.keys(items);
//     
// });