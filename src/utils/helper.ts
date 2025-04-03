// helper to get current tab Id
export async function getCurrentTab(): Promise<number | null> {
  try {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    if (tab && tab.id != undefined) {
      return tab.id;
    } else {
      console.warn("no active tab found");
      return null;
    }
  } catch (error) {
    console.error("error getting current tabId:", error);
    return null;
  }
}

//helper to send messages to a tab
export function sendMessageToTab(tabId: number, messageType: string): void {
  if (!tabId && !messageType) {
    console.error("tab Id and message type are required");
    return;
  }
  
  chrome.tabs.sendMessage(tabId, { type: messageType, tabId }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      console.log("Message sent successfully", response);
    }
  });
}
