chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    alert(message)
    if (!message.myPopupIsOpen) return;
    sendResponse({ name: "surya" })

    // Do your stuff
});
console.log("I am injected")