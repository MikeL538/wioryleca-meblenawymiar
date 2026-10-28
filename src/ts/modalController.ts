let activeModal: HTMLElement | null = null;
let returnFocus: HTMLElement | null = null;
const previousInert = new Map<HTMLElement, boolean>();
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableElements(modal: HTMLElement) {
  return Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
}

export function openDialog(modal: HTMLElement, trigger: HTMLElement) {
  if (activeModal === modal) return;
  if (!activeModal) {
    returnFocus = trigger;
    for (const child of document.body.children) {
      if (child instanceof HTMLElement) previousInert.set(child, child.inert);
    }
  }
  const previous = activeModal;
  activeModal = modal;
  modal.inert = false;
  modal.hidden = false;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  // Move focus before hiding the previous dialog from assistive technology.
  const dialog = modal.querySelector<HTMLElement>('[role="dialog"]') ?? modal;
  dialog.tabIndex = -1;
  (focusableElements(modal)[0] ?? dialog).focus();
  if (previous) {
    previous.classList.remove("is-open");
    previous.setAttribute("aria-hidden", "true");
    previous.hidden = true;
  }
  for (const child of previousInert.keys()) child.inert = child !== modal;
}

export function closeDialog() {
  if (!activeModal) return;
  const modal = activeModal;
  activeModal = null;
  previousInert.forEach((inert, element) => { element.inert = inert; });
  previousInert.clear();
  document.body.classList.remove("modal-open");
  if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus();
  else {
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.removeAttribute("tabindex");
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modal.hidden = true;
  returnFocus = null;
}

document.addEventListener("click", (event) => {
  if (!activeModal || !(event.target instanceof Element)) return;
  if (event.target === activeModal || event.target.closest(".modal__close")?.closest(".modal__backdrop") === activeModal) {
    closeDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (!activeModal) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeDialog();
  } else if (event.key === "Tab") {
    const elements = focusableElements(activeModal);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first) {
      event.preventDefault();
    } else if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement as HTMLElement))) {
      event.preventDefault();
      first.focus();
    }
  }
});
