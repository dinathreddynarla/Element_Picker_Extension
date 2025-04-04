import { removeLocalDataWithKey, sendMessageToTab } from "../utils/helper";

chrome.runtime.onInstalled.addListener(() => {
  console.log("backgroud script installed");
});

//send message to all tabs to notify storage update
//so that toggle status persist accross for each invidual tabs across all tabs
chrome.storage.onChanged.addListener((_, areaName) => {
  if (areaName === "local") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab && tab.id != undefined) {
          sendMessageToTab(tab.id,"storageUpdated")
        }
      });
    });
  }
});

//send message to a updated tab to notify storage update
//so that toggle status persist accross tab updates
chrome.tabs.onUpdated.addListener((tabId,changeInfo)=>{
    if(changeInfo.status === "complete"){
        sendMessageToTab(tabId,"storageUpdated")
    }
})

//clear storage to remove keys of tsbs when a tab is closed
chrome.tabs.onRemoved.addListener(async(tabId) =>{
  await removeLocalDataWithKey(`toggle_${tabId}`)
})