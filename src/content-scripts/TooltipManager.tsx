import { createRoot, Root } from "react-dom/client";
import CreateTooltip from "./CreateTooltip";
import { getSafeTooltipArray, ToolTip } from "../utils/tooltipStorage";
import { removeDeleteModeListeners } from "./content";

interface TooltipEntry {
  selector: string;
  content: string;
  target: Element;
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
          const existing = activeTooltips.get(selector);
          if (existing) {
            existing.root.unmount();
            existing.container.remove();
            activeTooltips.delete(selector);
          }
        }
    },
    { threshold: 0.6 }
  );

  observer.observe(target);
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
