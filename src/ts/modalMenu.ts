const modalMenu = document.querySelector<HTMLElement>("#modalMenu");
const modalOpenButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-modal-open="menu"]',
);
const modalCloseButton =
  modalMenu?.querySelector<HTMLButtonElement>(".modal__close");

const openModal = () => {
  if (!modalMenu) return;

  modalMenu.classList.add("is-open");
  modalMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
};

const closeModal = () => {
  if (!modalMenu) return;

  modalMenu.classList.remove("is-open");
  modalMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

modalOpenButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

modalCloseButton?.addEventListener("click", closeModal);

modalMenu?.addEventListener("click", (event) => {
  if (event.target === modalMenu) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalMenu?.classList.contains("is-open")) {
    closeModal();
  }
});
