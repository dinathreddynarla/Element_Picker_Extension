let tabIdGlobal: number;

//div to hover as a highlighter
const glowDiv = document.createElement("div");
glowDiv.classList.add("glow-div");
document.body.appendChild(glowDiv);

//listen message to get toggleupdate or tab update
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.type === "storageUpdated" && message.tabId) {
    tabIdGlobal = message.tabId;
    await handleToggleStatus(message.tabId);
    sendResponse({ success: true });
    return true;
  }
});

//function to handle toggle based on  status from storage(local)
async function handleToggleStatus(tabId: number) {
  const toggleStatus = await getToggleStatus(tabId);
  Object.values(toggleStatus)[0] ? attachListeners() : removeListeners();
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
    console.log("Clicked Element:", target);
    console.log("unique Selector >>>>>>>>>>> ", getUniqueSelector(target));
    const rect = target.getBoundingClientRect();
    let tooltip: HTMLElement = createTooltip(
      "hello world",
      rect.top + window.scrollY,
      rect.left + window.scrollX + rect.width
    );
    document.body.appendChild(tooltip);
    console.log(tooltip);
    removeListeners();
    chrome.storage.local.set({ [`toggle_${tabIdGlobal}`]: false });
  }
};

//attach listeners based on toggle status
function attachListeners() {
  document.addEventListener("mousemove", handleMouseMove, { capture: true });
  document.addEventListener("click", handleClick);
}

//remove listeners based on toggle status and if a element is selected
function removeListeners() {
  document.removeEventListener("mousemove", handleMouseMove, { capture: true });
  document.removeEventListener("click", handleClick);
  glowDiv.style.display = "none";
}

//listener to recieve message from page to remove any highlights left in parent before entering iframe
window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    glowDiv.style.display = "none";
  }
});

//to check if the current window and its parent is same , if it isn't then its a iframe
//so send a message to clear previous highlights and if if left, clear highlights in that window
// if (window.top !== window.self) {
//   window.document.addEventListener("mouseenter", () => {
//     window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
//   });
//   window.document.addEventListener("mouseleave", () => {
//     glowDiv.style.display = "none";
//   });
// }

//function to create a tooltip with tooltip text and top, left values to position it
function createTooltip(
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

//function to generate unique selector of a particular element
function getUniqueSelector(element: HTMLElement): string {
  const selectors: string[] = [];

  while (element.parentElement) {
    let currentSelector = element.tagName.toLowerCase();

    //check for an id (id is unique)
    if (element.id) {
      selectors.unshift(`#${element.id}`);
      break;
    }

    //classlisr have mutliple classes, so join all of them with "."
    if (element.className) {
        currentSelector +=  "." +element.className.trim().split(/\s+/).join(".")
    }

    //using nth-child to perfectly select the tag among multiple siblings
    const allSiblings = Array.from(element.parentElement.children);
    const index = allSiblings.indexOf(element) + 1;

    if (index > 1) {
      currentSelector += `:nth-child(${index})`;
    }

    //adding selectors form front side, so that we dont disrupt the path
    selectors.unshift(currentSelector);
    element = element.parentElement;
  }

  return selectors.join(" > ");
}



// //mutation observer
// const observer = new MutationObserver((mutations) => {
//     console.log(mutations);
//   });
  
//   observer.observe(document.body, {
//     attributes: true,
//     childList: true,
//     subtree: true,
//     characterData: true,
//   });
  
