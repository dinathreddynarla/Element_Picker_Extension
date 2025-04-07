//function to tract target position and reposition corresponding tooltip
export function trackTooltipPosition(
  target: HTMLElement,
  tooltip: HTMLElement
): () => void {
  const updatePosition = () => {
    const rect = target.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY}px`;
    tooltip.style.left = `${rect.left + window.scrollX + rect.width}px`;
    console.log(performance.now(),"hello>>>>>>>>>")
  };

  updatePosition();
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);

  const cleanup = () => {
    console.log("cleanup success for ",target);
    
    window.removeEventListener("scroll", updatePosition, true);
    window.removeEventListener("resize", updatePosition);
  };

  tooltip.addEventListener("remove", cleanup);

  return cleanup;
}
