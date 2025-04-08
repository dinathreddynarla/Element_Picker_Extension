import { renderTooltipIfVisible } from "./tooltipDOM";

//type for tooltip
export type ToolTip = {
  selector :string,
  content : string,
  path : string
}

let tooltips : ToolTip[];
//helper to get proper tooltip array of strings
export async function getSafeTooltipArray(): Promise<ToolTip[]> {
  try {
    let { tooltip } = await chrome.storage.local.get("tooltip");
    let path = window.location.pathname
    if(tooltip){
      tooltip = tooltip.filter((item:ToolTip)=> item.path == path)
    return tooltip;
    }
    return [];

  } catch (err) {
    console.error("Error fetching tooltip array:", err);
    return [];
  }
}
//function to update tooltip array
export async function updateToolTipArray(updatedToolTip: ToolTip) {
  try {
    let ToolTipArray: ToolTip[] = await getSafeTooltipArray();

    const exists = ToolTipArray.some(
      (tooltip) => tooltip.selector === updatedToolTip.selector
    );

    if (!exists) {
      ToolTipArray.push(updatedToolTip);
      await chrome.storage.local.set({ tooltip: ToolTipArray });
      console.log("Tooltip array updated successfully.");
    } else {
      console.log("Tooltip already exists. Skipping update.");
    }
  } catch (error) {
    console.error("Error updating tooltip array:", error);
  }
}


//function to get tooltips using helper for safer tooltip array of strings
export async function restoreTooltipsFromStorage(): Promise<void> {
  console.log("restoreTooltip triggered");
  const tooltipArray: ToolTip[] = await getSafeTooltipArray();
  if(tooltipArray.length == 0 ){
  console.log("tooltip array is empty");
    return;
  }
  tooltips = tooltipArray;
  startObserver()

}


const mutationObserver = new MutationObserver(() => {
  tooltips.forEach((tooltip: ToolTip): void => {
    const element = document.querySelector(tooltip.selector) as HTMLElement | null;

    if (element) {
      renderTooltipIfVisible(element, tooltip.selector, tooltip.content);
    } 
  });
});

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