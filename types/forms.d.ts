declare global {
  interface HTMLSelectElement extends HTMLElement {
    value: string;
  }

  interface HTMLInputElement extends HTMLElement {
    value: string;
  }
}

export {};
