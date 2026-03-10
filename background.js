

chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{

    if (changeInfo.url){
        sendToPython(changeInfo.url);
    }
});

chrome.tabs.onActivated.addListener((activeInfo)=>{
    chrome.tabs.get(activeInfo.tabId,(tab)=>{
        if (tab.url){
            sendToPython(tab.url);
        }
    });
});

chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener((newState)=>{
    console.log("System state: ", newState);

    if(newState ==="active"){
        //user is active
        chrome.tabs.query({active:true,lastFocusedWindow: true},(tabs)=>{
            if(tabs[0] &&tabs[0].url){
                console.log("User returend, resuming log for ", tabs[0].url);
                sendToPython(tabs[0].url);
            }
        });
    }
    else{
        //we are idle or locked
        sendToPython("IDLE");
    }
});


function sendToPython(url) {
    if (!url || url.startsWith('chrome://')) return;

    let domainName;

    if(url === "IDLE"){
        domainName = "IDLE";
    }
    else{
        try{
            domainName = new URL(url).hostname;
        }
        catch(e){
            console.error("Could not parse URL:",url);
            return;
        }
    }

    const dataToSend = {
        url: url,
        domain: domainName
    };

    fetch("http://127.0.0.1:8000/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
    })
    .catch(e => console.error("Python Server Offline", e));

}
