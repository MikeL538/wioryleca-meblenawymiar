const slideRight = document.querySelector<HTMLButtonElement>(
  "#realizationArrowRight",
);
const slideLeft = document.querySelector<HTMLButtonElement>(
  "#realizationArrowLeft",
);
const realizationList =
  document.querySelector<HTMLUListElement>("#realizationList");

function scrollRealizations(direction: number) {
  if (!realizationList) {
    return;
  }

  realizationList.scrollBy({
    left: (realizationList.clientWidth / 3) * direction,
    behavior: "smooth",
  });
}

slideRight?.addEventListener("click", () => scrollRealizations(1));
slideLeft?.addEventListener("click", () => scrollRealizations(-1));
