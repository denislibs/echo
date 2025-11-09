export function createElement(tag: string, attributes?: Record<string, string>): HTMLElement {
  const element = document.createElement(tag);
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }
  return element;
}

export function appendChild(parent: HTMLElement, child: Node): void {
  parent.appendChild(child);
}

export function removeChild(parent: HTMLElement, child: Node): void {
  parent.removeChild(child);
}

export function querySelector(selector: string): Element | null {
  return document.querySelector(selector);
}

export function querySelectorAll(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}

