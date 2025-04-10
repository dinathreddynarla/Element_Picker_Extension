import { createRoot, Root } from "react-dom/client";
import CreateTooltip from "./CreateTooltip";
import { getSafeTooltipArray, ToolTip } from "../utils/tooltipStorage";
import { removeDeleteModeListeners } from "./content";
import { VirtualElement } from "@popperjs/core";

interface TooltipEntry {
  selector: string;
  content: string;
  target: Element | VirtualElement;
  container: HTMLElement;
  root: Root;
}

const activeTooltips = new Map<string, TooltipEntry>();

export function observeTooltipVisibility(
  selector: string,
  target: Element,
  content: string
) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const isVisible = entry.isIntersecting;
      if (isVisible) {
        if (window.top === window.self) {
          if (!activeTooltips.has(selector)) {
            const container = document.createElement("div");
            container.className = "injected-tooltip-container";
            document.body.appendChild(container);

            const root = createRoot(container);
            root.render(
              <CreateTooltip
                target={target}
                content={content}
                selector={selector}
              />
            );

            activeTooltips.set(selector, {
              selector,
              content,
              target,
              container,
              root,
            });
          }
        } else {
          getPositionRelToTop(target).then((rect: DOMRect) => {
            console.log("Final rect values >>>>>>>> ", rect);
          
            // Send only cloneable plain values
            window.top?.postMessage(
              {
                type: "show tooltip",
                selector,
                content,
                rect: {
                  top: rect.top,
                  left: rect.left,
                  bottom: rect.bottom,
                  right: rect.right,
                  width: rect.width,
                  height: rect.height,
                  x: rect.x,
                  y: rect.y
                }
              },
              "*"
            );
          });
          
          
        }
      } else {
        if (window.top === window.self) {
          const existing = activeTooltips.get(selector);
          if (existing) {
            existing.root.unmount();
            existing.container.remove();
            activeTooltips.delete(selector);
          }
        } else {
          window.top?.postMessage(
            {
              type: "hide tooltip",
              selector,
            },
            "*"
          );
        }
      }
    },
    { threshold: 0.6 }
  );

  observer.observe(target);
}

//event to create virtual element based on co-ordinates from frames relative to top
if (window.top === window.self) {
  window.addEventListener("message", (event) => {
    const { data } = event;
    if (!data?.type) return;

    if (data.type == "show tooltip") {
      const { content, selector, rect } = data;
      if (!activeTooltips.has(selector)) {
        rect.x += window.scrollX;
        rect.y += window.scrollY;
        const virtualElement = {
          getBoundingClientRect: () => rect,
        };
        const container = document.createElement("div");
        container.className = "injected-tooltip-container";
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
          <CreateTooltip
            target={virtualElement}
            content={content}
            selector={selector}
          />
        );

        activeTooltips.set(selector, {
          selector,
          content,
          target: virtualElement,
          container,
          root,
        });
      }
    } else if (data.type === "hide tooltip") {
      const { selector } = data;
      const existing = activeTooltips.get(selector);
      if (existing) {
        existing.root.unmount();
        existing.container.remove();
        activeTooltips.delete(selector);
      }
    }
  });
}

export async function handleTooltipDelete(e: MouseEvent) {
  const tooltip = e.currentTarget as HTMLElement;
  const selector = tooltip.getAttribute("data-tooltip-for");
  if (selector) {
    const existing = activeTooltips.get(selector);
    if (existing) {
      existing.root.unmount();
      existing.container.remove();
      activeTooltips.delete(selector);
      const tooltipArray: ToolTip[] = await getSafeTooltipArray();
      const updatedArray = tooltipArray.filter(
        (item) => item.selector !== selector
      );
      await chrome.storage.local.set({ tooltip: updatedArray });
      console.log(`Tooltip for ${selector} deleted.`);
      removeDeleteModeListeners();
    }
  }
}

async function getPositionRelToTop(target: Element): Promise<DOMRect> {
  let rect = target.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top;
  console.log("target rect >>>>> ",rect)
  let currentWindow: Window | null = window;
  while (currentWindow !== window.top) {
    if (currentWindow.frameElement) {
      const iframeRect = (
        currentWindow.frameElement as HTMLElement
      ).getBoundingClientRect();
      x += iframeRect.left;
      y += iframeRect.top;
    } else {
      // window.parent.postMessage({ type: "get-my-rect" }, "*");
      // window.addEventListener("message", (event) => {
      //   if (event.data.type === "iframe-rect-result") {
      //     console.log("got rect values >>>>>>", event.data.rect);
      //     x += rect.left;
      //     y += rect.top;
      //   }
      // });
      const iframeRect = await getPositionFromParent()
      console.log("Values getting from Promise >>>>>>>>>> ",iframeRect);
      
      x += iframeRect.left;
      y += iframeRect.top;

    }
    console.log("rect values in each loop " , x,y);
    
    currentWindow = currentWindow.parent;
  }

  return new DOMRect(x, y, rect.width, rect.height);
}

window.addEventListener("message", (event) => {
  if (event.data.type === "get-my-rect") {
    const origin = event.origin;
    console.log("parent recieved message from iframe");
    const iframe = Array.from(document.querySelectorAll("iframe")).find(
      (iframe) => {
        try {
          return iframe.src.startsWith(origin);
        } catch (e) {
          return false;
        }
      }
    );

    if (iframe) {
      const rect = iframe.getBoundingClientRect();
      const targetWindow = event.source as Window;
      console.log("Parent sending rect to child >>>> ",rect)
      targetWindow.postMessage(
        {
          type: "iframe-rect-result",
          rect,
        },
        event.origin
      );
    }
  }
});


function getPositionFromParent(): Promise<DOMRect>{
   return new Promise((resolve)=>{
    console.log("Promise started");
    
     const handler = ( event : MessageEvent)=>{
      if(event?.data.type === "iframe-rect-result"){
        const { left, top, width, height } = event.data.rect;
        resolve(new DOMRect(left, top, width, height));
      }
     }

     window.addEventListener("message" , handler)
     window.parent.postMessage({ type: "get-my-rect" }, "*");
   })


}
