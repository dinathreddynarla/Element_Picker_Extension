//type for tooltip
export type ToolTip = {
  selector :string,
  content : string,
  path : string
}

export async function getSafeTooltipArray(): Promise<ToolTip[]> {
  try {
    let { tooltip } = await chrome.storage.local.get("tooltip");
    let path = window.location.pathname
    if(tooltip){
      tooltip = tooltip.filter((item:ToolTip)=> item.path == path)
      console.log(tooltip)
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
    let { tooltip } = await chrome.storage.local.get("tooltip");
    let ToolTipArray: ToolTip[] = tooltip
    console.log(ToolTipArray,updatedToolTip)
    const exists = ToolTipArray.some(
      (tooltip) => tooltip.selector === updatedToolTip.selector
    );

    if (!exists) {
      ToolTipArray.push(updatedToolTip);
      await chrome.storage.local.set({ tooltip: ToolTipArray });
      console.log("Tooltip array updated successfully.");
      console.log(ToolTipArray)
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
}
