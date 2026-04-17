import { imageGenerate, amountWardrobe, name } from "./imagesGenerator";

const offerWardrobeAnchor = document.querySelector("#offerWardrobeAnchor");

offerWardrobeAnchor?.addEventListener("click", () => {
  setTimeout(() => {
    document.addEventListener("DOMContentLoaded", () => {
      imageGenerate(amountWardrobe, name);
    });
  }, 1000);
});
