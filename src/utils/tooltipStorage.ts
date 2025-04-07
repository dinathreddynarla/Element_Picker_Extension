import { renderTooltipIfVisible } from "./tooltipDOM";

//helper to get proper tooltip array of strings
export async function getSafeTooltipArray(): Promise<string[]> {
  try {
    const { tooltip } = await chrome.storage.local.get("tooltip");

    if (
      Array.isArray(tooltip) &&
      tooltip.every((item) => typeof item === "string")
    ) {
      return tooltip;
    }

    console.warn(
      "Tooltip data is not a valid string array. Returning empty array."
    );
    return [];
  } catch (err) {
    console.error("Error fetching tooltip array:", err);
    return [];
  }
}

//function to update tooltip array
export async function updateToolTipArray(updatedToolTip: string) {
  try {
    let ToolTipArray: string[] = await getSafeTooltipArray();

    if (!ToolTipArray.includes(updatedToolTip)) {
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
  const tooltipArray: string[] = await getSafeTooltipArray();
  if(tooltipArray.length == 0 ){
  console.log("tooltip array is empty");
    return;
  }
  tooltipArray.forEach((selector: string): void => {
    const element = document.querySelector(selector) as HTMLElement | null;

    if (element) {
      renderTooltipIfVisible(element, selector);
    } else {
      // element not in DOM , but if tooltip is there remove it
      const existingTooltip = document.querySelector(
        `[data-tooltip-for="${selector}"]`
      );
      if (existingTooltip instanceof HTMLElement) {
        existingTooltip.dispatchEvent(new Event("remove"));
        existingTooltip.remove();
      }
    }
  });
}
