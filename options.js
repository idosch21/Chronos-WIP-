document.getElementById('saveBtn').addEventListener('click', () => {
    const url = document.getElementById('apiUrl').value;
    chrome.storage.sync.set({ apiBaseUrl: url }, () => {
        document.getElementById('status').innerText = "URL Saved! Chronos is ready.";
    });
});