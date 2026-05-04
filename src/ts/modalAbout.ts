const modalAbout = document.querySelector<HTMLElement>("#modalAbout");
const modalOpenButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-modal-open="about"]',
);
const modalCloseButton =
  modalAbout?.querySelector<HTMLButtonElement>(".modal__close");

const openModal = () => {
  if (!modalAbout) return;

  modalAbout.classList.add("is-open");
  modalAbout.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
};

const closeModal = () => {
  if (!modalAbout) return;

  modalAbout.classList.remove("is-open");
  modalAbout.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

modalOpenButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

modalCloseButton?.addEventListener("click", closeModal);

modalAbout?.addEventListener("click", (event) => {
  if (event.target === modalAbout) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalAbout?.classList.contains("is-open")) {
    closeModal();
  }
});
