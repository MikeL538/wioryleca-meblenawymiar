const modalImage = document.querySelector<HTMLElement>("#modalImage");
const modalCloseButton =
  modalImage?.querySelector<HTMLButtonElement>(".modal__close");
const modalImageElement = modalImage?.querySelector<HTMLImageElement>(
  ".modal__image--image",
);

const openModal = (image: HTMLImageElement) => {
  // imageSrc: string => image: HTMLImageElement
  if (!modalImage) return;

  // Images to Array
  galleryImages = Array.from(
    document.querySelectorAll<HTMLImageElement>(
      '[data-modal-open="image"] img',
    ),
  );

  currentImageIndex = galleryImages.indexOf(image);
  setModalImage(image);

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
  if (image) {
    openModal(image);
  }
});

modalCloseButton?.addEventListener("click", closeModal);

modalImage?.addEventListener("click", (event) => {
  if (event.target === modalImage) {
    closeModal();
  }
});

// document.addEventListener("keydown", (event) => {
//   if (event.key === "Escape" && modalImage?.classList.contains("is-open")) {
//     closeModal();
//   }
// });

// ===========
// MODAL IMAGES CONTROLS
let galleryImages: HTMLImageElement[] = [];
let currentImageIndex = -1;

// Check if modal open
const isModalOpen = () => modalImage?.classList.contains("is-open") ?? false;

const setModalImage = (image: HTMLImageElement) => {
  if (!modalImageElement) return;

  modalImageElement.src = image.currentSrc || image.src;
  modalImageElement.alt = image.alt;
};

const showImageByOffset = (offset: number) => {
  if (!isModalOpen() || !galleryImages.length) return;

  currentImageIndex =
    (currentImageIndex + offset + galleryImages.length) % galleryImages.length;

  setModalImage(galleryImages[currentImageIndex]);
};

// Keyboards Arrows
document.addEventListener("keydown", (event) => {
  if (!isModalOpen()) return;

  if (event.key === "Escape") {
    closeModal();
  }

  if (event.key === "ArrowRight") {
    showImageByOffset(1);
    if (galleryImages.length === currentImageIndex + 1) {
      alert("Koniec zdjęć na tej stronie.");
    }
  }

  if (event.key === "ArrowLeft") {
    showImageByOffset(-1);
  }
});

const modalImageRight =
  document.querySelector<HTMLButtonElement>("#modalImageRight");
const modalImageLeft =
  document.querySelector<HTMLButtonElement>("#modalImageLeft");

modalImageRight?.addEventListener("click", () => {
  if (!isModalOpen()) return;
  showImageByOffset(1);
  if (galleryImages.length === currentImageIndex + 1) {
    alert("Koniec zdjęć na tej stronie.");
  }
});

modalImageLeft?.addEventListener("click", () => {
  if (!isModalOpen()) return;
  showImageByOffset(-1);
});
