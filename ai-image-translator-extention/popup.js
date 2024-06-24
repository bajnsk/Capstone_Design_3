document.getElementById('translateButton').addEventListener('click', () => {
    console.log('Translate Button Clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            console.log('Active Tab URL:', activeTab.url);
            if (!activeTab.url.startsWith('chrome://')) {
                chrome.tabs.sendMessage(activeTab.id, { action: "readClipboardImage" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else {
                        console.log('Message sent to content script:', response);
                    }
                });
            } else {
                console.error('Cannot execute script on chrome:// URLs.');
            }
        }
    });
});
