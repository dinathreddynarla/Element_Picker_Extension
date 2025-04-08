import {  trackTooltipPosition } from "../utils/trackTooltipPosition";
import { getUniqueSelector } from "../utils/uniqueSelector";
import { restoreTooltipsFromStorage, updateToolTipArray } from "../utils/tooltipStorage";
import { createTooltip ,handleTooltipDelete } from "../utils/tooltipDOM";
import { startObserver,stopObserver } from "../utils/tooltipStorage";


restoreTooltipsFromStorage()

let tabIdGlobal: number;

//div to hover as a highlighter
const glowDiv = document.createElement("div");
glowDiv.classList.add("glow-div");
document.body.appendChild(glowDiv);

//listen message to get toggleupdate or tab update
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  switch (message.type) {
    case "storageUpdated":
      if (message.tabId) {
        tabIdGlobal = message.tabId;
        await handleToggleStatus(message.tabId);
        sendResponse({ success: true });
        return true;
      }
      break;

    case "toggleDeleteMode":
      if (message.action === "enable") {
        attachDeleteModeListeners();
      } else if (message.action === "disable") {
        removeDeleteModeListeners();
      } else {
        console.warn("action unknown for toggleDeleteMode:", message.action);
      }
      break;

    default:
      console.warn("Unknown message type:", message.type);
  }
});

//function to handle toggle based on  status from storage(local)
async function handleToggleStatus(tabId: number) {
  const toggleStatus = await getToggleStatus(tabId);
  Object.values(toggleStatus)[0]
    ? attachToolTipListeners()
    : removeToolTipListeners();
}

// function to get the togle status of that tab from storage(local)
async function getToggleStatus(tabId: number): Promise<Record<string, number>> {
  try {
    const result = await chrome.storage.local.get([`toggle_${tabId}`]);
    return result;
  } catch (error) {
    console.error("Error fetching toggle status:", error);
    throw error;
  }
}

//mouse event (move) to hover the highlighter over target element
const handleMouseMove = (event: MouseEvent) => {
  event.stopPropagation();
  const target = event.composedPath()[0] || event.target;

  if (target instanceof HTMLElement) {
    const rect = target.getBoundingClientRect();
    Object.assign(glowDiv.style, {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      display: "block",
    });
  }
};

//mouse event (click) to log >>>> element, unique selector, add tooltip
const handleClick = (event: MouseEvent) => {
  event.preventDefault();

  const target = event.target;
  if (target instanceof HTMLElement) {
    let content = prompt("enter tooltip text")?.trim() as string;
    if(content.length == 0){
      content = "This a tooltip"
    }
    const path = window.location.pathname
    const selector: string = getUniqueSelector(target);
    const rect = target.getBoundingClientRect();
    let tooltip: HTMLElement = createTooltip(
      content,
      rect.top + window.scrollY,
      rect.left + window.scrollX + rect.width
    );
    trackTooltipPosition(target, tooltip);
    //passing object to updateToolTipArray
    tooltip.setAttribute("data-tooltip-for", selector);
    updateToolTipArray({selector , content , path});
    document.body.appendChild(tooltip);
    chrome.storage.local.set({ [`toggle_${tabIdGlobal}`]: false });
    
  }
};

//attach listeners based on toggle status
function attachToolTipListeners() {
  document.addEventListener("mousemove", handleMouseMove, { capture: true });
  document.addEventListener("click", handleClick);
}

//remove listeners based on toggle status and if a element is selected
function removeToolTipListeners() {
  document.removeEventListener("mousemove", handleMouseMove, { capture: true });
  document.removeEventListener("click", handleClick);
  glowDiv.style.display = "none";
}

function attachDeleteModeListeners() {
  chrome.storage.local.set({ [`toggle_${tabIdGlobal}`]: false });
  stopObserver()
  const tooltips = document.querySelectorAll("[data-tooltip-for]");

  tooltips.forEach((tooltip) => {
    if (tooltip instanceof HTMLElement) {
      tooltip.addEventListener("click", handleTooltipDelete);
      tooltip.classList.add("deletable-tooltip");
    }
  });
}

export function removeDeleteModeListeners() {
  startObserver()
  const tooltips = document.querySelectorAll("[data-tooltip-for]");

  tooltips.forEach((tooltip) => {
    if (tooltip instanceof HTMLElement) {
      tooltip.removeEventListener("click", handleTooltipDelete); // if needed, store the handler reference
      tooltip.classList.remove("deletable-tooltip");
    }
  });
}

//listener to recieve message from page to remove any highlights left in parent before entering iframe
window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    glowDiv.style.display = "none";
  }
});

//to check if the current window and its parent is same , if it isn't then its a iframe
//so send a message to clear previous highlights and if if left, clear highlights in that window
if (window.top !== window.self) {
  window.document.addEventListener("mouseenter", () => {
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
  });
  window.document.addEventListener("mouseleave", () => {
    glowDiv.style.display = "none";
  });
}







