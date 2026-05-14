function initModal(modalSelector: string, openSelector: string) {
  const modal = document.querySelector<HTMLElement>(modalSelector);
  if (!modal) return;

  const openButtons =
    document.querySelectorAll<HTMLButtonElement>(openSelector);
  const closeButton = modal.querySelector<HTMLButtonElement>(".modal__close");

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  closeButton?.addEventListener("click", closeModal);
}

initModal("#modalMenu", '[data-modal-open="menu"]');
initModal("#modalCoop", '[data-modal-open="coop"]');
initModal("#modalContact", '[data-modal-open="contact"]');
initModal("#modalAbout", '[data-modal-open="about"]');
