import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined" && window.HTMLDialogElement) {
  const dialogProto = window.HTMLDialogElement.prototype as any;
  if (!dialogProto.showModal) {
    dialogProto.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "true");
    };
  }
  if (!dialogProto.close) {
    dialogProto.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as any;
}
