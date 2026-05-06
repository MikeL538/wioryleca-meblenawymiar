const modalCoop = document.querySelector<HTMLElement>("#modalCoop");
const modalOpenButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-modal-open="coop"]',
);
const modalCloseButton =
  modalCoop?.querySelector<HTMLButtonElement>(".modal__close");

const openModal = () => {
  if (!modalCoop) return;

  modalCoop.classList.add("is-open");
  modalCoop.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
};

const closeModal = () => {
  if (!modalCoop) return;

  modalCoop.classList.remove("is-open");
  modalCoop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

modalOpenButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

modalCloseButton?.addEventListener("click", closeModal);

modalCoop?.addEventListener("click", (event) => {
  if (event.target === modalCoop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalCoop?.classList.contains("is-open")) {
    closeModal();
  }
});
