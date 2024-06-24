chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translateImage",
        title: "Translate Image",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "translateImage") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: readClipboardImage
        });
    }
});

async function readClipboardImage() {
    try {
        const data = await navigator.clipboard.read();
        for (let item of data) {
            if (item.types.includes("image/png")) {
                const blob = await item.getType("image/png");
                const reader = new FileReader();
                reader.onload = () => {
                    const base64data = reader.result;
                    chrome.runtime.sendMessage({ action: "translateImage", image: base64data });
                };
                reader.readAsDataURL(blob);
            } else {
                alert("No image found in clipboard.");
            }
        }
    } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translateImage") {
        fetch('http://localhost:5000/image_translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: request.image })
        })
        .then(response => response.json())
        .then(data => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (translatedImageUrl) => {
                        const translatedImage = new Image();
                        translatedImage.src = translatedImageUrl;
                        document.body.appendChild(translatedImage);
                    },
                    args: [`http://localhost:5000/static/${data.translated_image}`]
                });
            });
        })
        .catch(error => {
            console.error('Error translating image:', error);
        });
    }
});
