document.getElementById('open-dashboard').addEventListener('click', () => {
    // This tells Chrome to open a new tab with your index.html
    // Note: Chrome extensions use 'chrome.tabs' to navigate
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});