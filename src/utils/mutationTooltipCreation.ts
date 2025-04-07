import { restoreTooltipsFromStorage } from "./tooltipStorage";

//mutation observer
const mutationObserver = new MutationObserver(() => {
    restoreTooltipsFromStorage();
  });
  
//function to start mutation for tooltip updation  
  export function startObserver() {
      console.log("hello mutation started");
      
      mutationObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });
  }

//function to stop observer for deletion
  export function stopObserver() {
      console.log("hello mutation stopped");
      
      mutationObserver.disconnect()
  }
  