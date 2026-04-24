
const IGNORED_SCHEMES = ['chrome://', 'file:///', 'chrome-extension://', 'edge://'];
const IGNORED_DOMAINS = ['newtab', 'extensions', 'settings', 'blank', 'system/'];

// --- 1. INITIALIZATION ---
chrome.runtime.onInstalled.addListener(() => {
    // Heartbeat runs every 15 seconds to double-check state
    chrome.alarms.create("heartbeat", { periodInMinutes: 0.25 }); 
    console.log("Chronos extension started.");
});

// --- 2. FOCUS & WINDOW TRACKING (The "Fix") ---
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // This fires the MOMENT you click an app outside of Chrome (VS Code, Spotify, etc.)
        console.log("OS Focus Lost: Chrome is background.");
        sendToPython("IDLE");
    } else {
        // You just clicked back into a Chrome window
        console.log("OS Focus Gained: Chrome is active.");
        reportActiveTab();
    }
});

// --- 3. HEARTBEAT (The Safety Net) ---
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "heartbeat") {
        // Check if ANY chrome window is currently the OS-level focused window
        chrome.windows.getLastFocused({ populate: false }, (win) => {
            if (win && win.focused) {
                // If Chrome is focused, check if the user is actually typing/moving mouse
                chrome.idle.queryState(30, (state) => {
                    if (state === "active") {
                        reportActiveTab();
                    } else {
                        // Check for meetings/media before idling
                        checkMediaAndReport();
                    }
                });
            } else {
                // If Chrome is open but NOT the focused app on your PC
                sendToPython("IDLE");
            }
        });
    }
});

// --- 4. TAB & ACTIVITY LISTENERS ---
chrome.tabs.onActivated.addListener(() => reportActiveTab());

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // Only report if the URL change happened in the window the user is looking at
        chrome.windows.get(tab.windowId, (win) => {
            if (win.focused) {
                sendToPython(changeInfo.url);
            }
        });
    }
});

chrome.idle.onStateChanged.addListener((newState) => {
    if (newState === "active") {
        reportActiveTab();
    } else {
        checkMediaAndReport();
    }
});

// --- 5. HELPERS ---

function reportActiveTab() {
    // query the active tab in the window that is currently focused
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            sendToPython(tabs[0].url);
        }
    });
}

function checkMediaAndReport() {
    // Look for ANY tab that is either playing sound or is a known meeting domain
    chrome.tabs.query({}, (allTabs) => {
        const activeMediaTab = allTabs.find(tab => {
            const isMeeting = tab.url && (tab.url.includes("meet.google.com") || tab.url.includes("zoom.us"));
            return tab.audible || isMeeting;
        });

        if (activeMediaTab) {
            // If we found a tab playing media/meeting, keep reporting it!
            console.log("System is idle, but media/meeting is active on:", activeMediaTab.url);
            sendToPython(activeMediaTab.url);
        } else {
            // Truly idle: no audio, no meeting, no input.
            console.log("System is idle and silent. Sending IDLE.");
            sendToPython("IDLE");
        }
    });
}
let lastReportedDomain = ""; // Tracks the last thing we told Python

function sendToPython(url) {
    if (!url) return;

    let domainName = "idle";
    let isIgnored = (url === "IDLE" || IGNORED_SCHEMES.some(scheme => url.startsWith(scheme)));

    if (!isIgnored) {
        try {
            domainName = new URL(url).hostname;
            if (IGNORED_DOMAINS.some(d => domainName.toLowerCase().includes(d.toLowerCase()))) {
                domainName = "idle";
            }
        } catch (e) {
            domainName = "idle";
        }
    }

    // --- THE STATE GATE ---
    // If we are idle now AND we were already idle, STOP. Don't ping the server.
    if (domainName === "idle" && lastReportedDomain === "idle") {
        return; 
    }

    // Update our tracker
    lastReportedDomain = domainName;

    console.log(">>> Reporting to Python:", domainName);

    chrome.storage.sync.get(['apiBaseUrl'], (result) => {
        const backendUrl = result.apiBaseUrl;
        
        if (!backendUrl) {
            console.log("No API URL configured yet.");
            return; 
        }

        const dataToSend = { url: url, domain: domainName };
        fetch(`${backendUrl}/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        }).catch(err => console.error("Python Offline"));
    });
}
