const modal = {
  modalMenu: document.querySelector<HTMLElement>("#modalMenu"),
};

const OpenButtons = {
  modalOpenButtons: document.querySelectorAll<HTMLButtonElement>(
    '[data-modal-open="menu"]',
  ),
};

const CloseButton = {
  modalMenu: document.querySelector<HTMLButtonElement>(".modal__close"),
};

function openModal(modal: HTMLElement) {
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal?.focus();
}

function closeModal(modal: HTMLElement) {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

OpenButtons.modalOpenButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (modal.modalMenu) openModal(modal.modalMenu);
  });
});

CloseButton.modalMenu?.addEventListener("click", () => {
  if (modal.modalMenu) closeModal(modal.modalMenu);
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modal.modalMenu?.classList.contains("is-open")
  ) {
    closeModal(modal.modalMenu);
  }
});

modal.modalMenu?.addEventListener("click", (event) => {
  if (event.target === modal.modalMenu && modal.modalMenu) {
    closeModal(modal.modalMenu);
  }
});
