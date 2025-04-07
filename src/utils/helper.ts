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
  chrome.tabs.sendMessage(tabId, { type: messageType, tabId }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      console.log("Message sent successfully", response);
    }
  });
}

// helper to remove storage of extension state of a tab, if tab is closed
export async function removeLocalDataWithKey(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
  console.log("remove storaged for the key ",key)
  if (chrome.runtime.lastError) {
    console.error(
      "Error removing storage key:",
      chrome.runtime.lastError.message
    );
  }
}
