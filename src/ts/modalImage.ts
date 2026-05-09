const modalImage = document.querySelector<HTMLElement>("#modalImage");
const modalCloseButton =
  modalImage?.querySelector<HTMLButtonElement>(".modal__close");
const modalImageElement =
  modalImage?.querySelector<HTMLImageElement>(".modal__image--image");

const openModal = (imageSrc?: string, imageAlt?: string) => {
  if (!modalImage) return;

  if (imageSrc && modalImageElement) {
    modalImageElement.src = imageSrc;
    modalImageElement.alt = imageAlt ?? "";
  }

  modalImage.classList.add("is-open");
  modalImage.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalCloseButton?.focus();
};

const closeModal = () => {
  if (!modalImage) return;

  modalImage.classList.remove("is-open");
  modalImage.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

document.addEventListener("click", (event) => {
  const openButton = (event.target as Element | null)?.closest<HTMLElement>(
    '[data-modal-open="image"]',
  );

  if (!openButton) return;

  const image = openButton.querySelector<HTMLImageElement>("img");
  openModal(image?.currentSrc || image?.src, image?.alt);
});

modalCloseButton?.addEventListener("click", closeModal);

modalImage?.addEventListener("click", (event) => {
  if (event.target === modalImage) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalImage?.classList.contains("is-open")) {
    closeModal();
  }
});
