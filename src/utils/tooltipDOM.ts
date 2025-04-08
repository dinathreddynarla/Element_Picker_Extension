import { removeDeleteModeListeners } from "../content-scripts/content";
import { getSafeTooltipArray, ToolTip } from "./tooltipStorage";
import { trackTooltipPosition } from "./trackTooltipPosition";

//function to create a tooltip with tooltip text and top, left values to position it
export function createTooltip(
  text: string,
  top: number,
  left: number
): HTMLDivElement {
  // Create wrapper div
  const tooltipWrapper = document.createElement("div");
  tooltipWrapper.classList.add("tooltip-wrapper");
  tooltipWrapper.style.top = `${top}px`;
  tooltipWrapper.style.left = `${left}px`;

  // Create tooltip icon
  const tooltipIcon = document.createElement("span");
  tooltipIcon.textContent = "❓";
  tooltipIcon.classList.add("tooltip-icon");

  // Create tooltip text
  const tooltipText = document.createElement("span");
  tooltipText.textContent = text;
  tooltipText.classList.add("tooltip-text");

  // Append elements
  tooltipWrapper.appendChild(tooltipIcon);
  tooltipWrapper.appendChild(tooltipText);

  return tooltipWrapper;
}

//delete selected tooltip
export async function handleTooltipDelete(e: MouseEvent) {
  const tooltip = e.currentTarget as HTMLElement;
  const selector = tooltip.getAttribute("data-tooltip-for");

  if (selector) {
    tooltip.dispatchEvent(new Event("remove"));
    tooltip.remove();

    // Update local storage to remove this selector
    const tooltipArray: ToolTip[] = await getSafeTooltipArray();
    const updatedArray = tooltipArray.filter(
      (item) => item.selector !== selector
    );
    await chrome.storage.local.set({ tooltip: updatedArray });

    console.log(`Tooltip for ${selector} deleted.`);
    removeDeleteModeListeners();
  }
}

//keep a map of all observed elements
const observerMap = new Map<String, IntersectionObserver>();

export function renderTooltipIfVisible(
  element: HTMLElement,
  selector: string,
  content: string
) {
  // Avoid duplicate observers
  if (observerMap.has(selector)) {
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    let existingTooltip: HTMLElement | null = document.querySelector(
      `[data-tooltip-for="${selector}"]`
    );
    console.log(observerMap , "<<<<<<<<<<<<<<<<<,, tooltip");
    
    if (entry.isIntersecting) {
      if (!existingTooltip) {
        const rect = element.getBoundingClientRect();
        const tooltip = createTooltip(
          content,
          rect.top + window.scrollY,
          rect.left + window.scrollX + rect.width
        );
        tooltip.setAttribute("data-tooltip-for", selector);
        document.body.appendChild(tooltip);
        trackTooltipPosition(element, tooltip);
      }
    } else {
      if (existingTooltip) {
        existingTooltip.dispatchEvent(new Event("remove"));
        existingTooltip.remove();
      }
    }

    // Always clean up this observer after it's done
    observer.disconnect();
    observerMap.delete(selector);
  });

  observer.observe(element);
  observerMap.set(selector, observer);
}
