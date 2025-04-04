import { removeLocalDataWithKey, sendMessageToTab } from "../utils/helper";

chrome.runtime.onInstalled.addListener(() => {
  console.log("backgroud script installed");
});

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
 
chrome.tabs.onUpdated.addListener((tabId,changeInfo)=>{
    if(changeInfo.status === "complete"){
        sendMessageToTab(tabId,"storageUpdated")
    }
})

chrome.tabs.onRemoved.addListener(async(tabId) =>{
  await removeLocalDataWithKey(`toggle_${tabId}`)
})