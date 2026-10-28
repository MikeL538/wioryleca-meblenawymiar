import { openDialog } from "./modalController";

const modal = document.querySelector<HTMLElement>("#modalImage");
const preview = modal?.querySelector<HTMLImageElement>(".modal__image--image");
const counter = modal?.querySelector<HTMLElement>("#modalImageCounter");
let images: HTMLImageElement[] = [];
let currentIndex = 0;

function showImage(offset = 0) {
  if (!preview || !images.length) return;
  currentIndex = (currentIndex + offset + images.length) % images.length;
  const image = images[currentIndex];
  preview.src = image.currentSrc || image.src;
  preview.alt = image.alt;
  if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
}

document.addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-modal-open="image"]');
  const image = trigger?.querySelector<HTMLImageElement>("img");
  if (!modal || !trigger || !image) return;
  event.preventDefault();
  images = Array.from(document.querySelectorAll<HTMLImageElement>('[data-modal-open="image"] img'));
  currentIndex = images.indexOf(image);
  showImage();
  openDialog(modal, trigger);
});

document.addEventListener("keydown", (event) => {
  if (!modal?.classList.contains("is-open")) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(event.key === "ArrowRight" ? 1 : -1);
  }
});

document.querySelector("#modalImageRight")?.addEventListener("click", () => showImage(1));
document.querySelector("#modalImageLeft")?.addEventListener("click", () => showImage(-1));
