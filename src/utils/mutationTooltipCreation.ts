import { restoreTooltipsFromStorage } from "./tooltipStorage";

//mutation observer
const persistentObserver = new MutationObserver(() => {
    restoreTooltipsFromStorage();
  });
  
//function to start mutation for tooltip updation  
  export function startObserver() {
      console.log("hello mutation started");
      
      persistentObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });
  }

//function to stop observer for deletion
  export function stopObserver() {
      console.log("hello mutation stopped");
      
      persistentObserver.disconnect()
  }
  