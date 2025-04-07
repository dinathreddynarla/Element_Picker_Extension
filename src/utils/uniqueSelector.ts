//function to generate unique selector of a particular element
export function getUniqueSelector(element: HTMLElement): string {
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
      currentSelector += "." + element.className.trim().split(/\s+/).join(".");
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
