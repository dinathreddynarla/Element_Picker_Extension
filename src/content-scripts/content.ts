let tabIdGlobal : number  ;
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.type === "storageUpdated" && message.tabId) {
    tabIdGlobal = message.tabId
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
Object.assign(glowDiv.style, {
  position: "absolute",
  border: "2px solid red",
  pointerEvents: "none",
  transition: "all 0.1s ease-in-out",
  zIndex: "9999",
  display: "none",
});
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
    let tooltip:HTMLElement = createTooltip("hello world" ,rect.top + window.scrollY,rect.left + window.scrollX+rect.width )
    document.body.appendChild(tooltip)
    console.log(tooltip)
    removeListeners();
    chrome.storage.local.set({ [`toggle_${tabIdGlobal}`]: false });
  }
};

function attachListeners() {
  document.addEventListener("mousemove", handleMouseMove, { capture: true });
  document.addEventListener("click", handleClick);
}

function removeListeners() {
  document.removeEventListener("mousemove", handleMouseMove, {capture: true});
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


function createTooltip(text: string, top: number, left: number): HTMLDivElement {
    // Create wrapper div
    const tooltipWrapper = document.createElement("div");
    tooltipWrapper.style.position = "absolute";
    tooltipWrapper.style.display = "inline-block";
    tooltipWrapper.style.cursor = "pointer";
    tooltipWrapper.style.top = `${top}px`;
    tooltipWrapper.style.left = `${left}px`;
    
    // Create tooltip icon
    const tooltipIcon = document.createElement("span");
    tooltipIcon.textContent = "❓"; 
    tooltipIcon.style.fontSize = "16px";
    tooltipIcon.style.border = "1px solid #ccc";
    tooltipIcon.style.borderRadius = "50%";
    tooltipIcon.style.padding = "2px 6px";
    tooltipIcon.style.backgroundColor = "#f1f1f1";

  
    // Create tooltip text
    const tooltipText = document.createElement("span");
    tooltipText.textContent = text;
    tooltipText.style.position = "absolute";
    tooltipText.style.padding = "5px 10px";
    tooltipText.style.backgroundColor = "#333";
    tooltipText.style.color = "#fff";
    tooltipText.style.borderRadius = "4px";
    tooltipText.style.whiteSpace = "nowrap";
    tooltipText.style.fontSize = "12px";
    tooltipText.style.visibility = "hidden";
    tooltipText.style.opacity = "0";
    tooltipText.style.transition = "opacity 0.3s ease-in-out";
  
  
    // Show tooltip on hover
    tooltipWrapper.addEventListener("mouseenter", () => {
      tooltipText.style.visibility = "visible";
      tooltipText.style.opacity = "1";
    });
  
    // Hide tooltip on mouse leave
    tooltipWrapper.addEventListener("mouseleave", () => {
      tooltipText.style.visibility = "hidden";
      tooltipText.style.opacity = "0";
    });
  
    // Append elements
    tooltipWrapper.appendChild(tooltipIcon);
    tooltipWrapper.appendChild(tooltipText);
  
    return tooltipWrapper;
  }
  

  