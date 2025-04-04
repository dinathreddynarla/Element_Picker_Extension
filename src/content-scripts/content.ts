let tabIdGlobal: number;
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.type === "storageUpdated" && message.tabId) {
    tabIdGlobal = message.tabId;
    await handleToggleStatus(message.tabId);
    sendResponse({ success: true });
    return true;
  }
});

async function handleToggleStatus(tabId: number) {
  const toggleStatus = await getToggleStatus(tabId);
  Object.values(toggleStatus)[0] ? attachListeners() : removeListeners();
}

async function getToggleStatus(tabId: number): Promise<Record<string, number>> {
  try {
    const result = await chrome.storage.local.get([`toggle_${tabId}`]);
    return result;
  } catch (error) {
    console.error("Error fetching toggle status:", error);
    throw error;
  }
}
const glowDiv = document.createElement("div");
glowDiv.classList.add("glow-div");
document.body.appendChild(glowDiv);

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

const handleClick = (event: MouseEvent) => {
  event.preventDefault();

  const target = event.target;
  if (target instanceof HTMLElement) {
    console.log("Clicked Element:", target);
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

function attachListeners() {
  document.addEventListener("mousemove", handleMouseMove, { capture: true });
  document.addEventListener("click", handleClick);
}

function removeListeners() {
  document.removeEventListener("mousemove", handleMouseMove, { capture: true });
  document.removeEventListener("click", handleClick);
  glowDiv.style.display = "none";
}

window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    glowDiv.style.display = "none";
  }
});

if (window.top !== window.self) {
  window.document.addEventListener("mouseenter", () => {
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
  });
  window.document.addEventListener("mouseleave", () => {
    glowDiv.style.display = "none";
  });
}

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
