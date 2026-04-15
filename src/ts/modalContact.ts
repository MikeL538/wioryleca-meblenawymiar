const modalContact = document.querySelector<HTMLElement>("#modalContact");
const modalOpenButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-modal-open="contact"]',
);
const modalCloseButton = modalContact?.querySelector<HTMLButtonElement>(
  ".modal__close",
);

const openModal = () => {
  if (!modalContact) return;

  modalContact.classList.add("is-open");
  modalContact.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
};

const closeModal = () => {
  if (!modalContact) return;

  modalContact.classList.remove("is-open");
  modalContact.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

modalOpenButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

modalCloseButton?.addEventListener("click", closeModal);

modalContact?.addEventListener("click", (event) => {
  if (event.target === modalContact) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalContact?.classList.contains("is-open")) {
    closeModal();
  }
});
