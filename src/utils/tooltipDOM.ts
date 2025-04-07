import { removeDeleteModeListeners } from "../content-scripts/content";
import { getSafeTooltipArray } from "./tooltipStorage";
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
    const tooltipArray: string[] = await getSafeTooltipArray();
    const updatedArray = tooltipArray.filter((item) => item !== selector);
    await chrome.storage.local.set({ tooltip: updatedArray });

    console.log(`Tooltip for ${selector} deleted.`);
    removeDeleteModeListeners()
  }
}

//keep a map of all observed elements
const observedSelectors = new Set<string>();

//function to render tooltip if visible
export function renderTooltipIfVisible(element: HTMLElement, selector: string) {
  if (observedSelectors.has(selector)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      const existingTooltip = document.querySelector(
        `[data-tooltip-for="${selector}"]`
      );

      if (entry.isIntersecting) {
        if (!existingTooltip) {
          const rect = element.getBoundingClientRect();
          const tooltip = createTooltip(
            "hello world",
            rect.top + window.scrollY,
            rect.left + window.scrollX + rect.width
          );
          tooltip.setAttribute("data-tooltip-for", selector);
          document.body.appendChild(tooltip);
          trackTooltipPosition(element,tooltip)
        }

        //stop observing once shown
        obs.unobserve(entry.target);
      }
    });
  });

  observer.observe(element);
  observedSelectors.add(selector);
}
