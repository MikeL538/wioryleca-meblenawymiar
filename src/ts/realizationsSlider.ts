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

  const items = realizationList.children;
  const first = items[0] as HTMLElement | undefined;
  const second = items[1] as HTMLElement | undefined;
  if (!first || !second) return;
  realizationList.scrollBy({
    left: (second.offsetLeft - first.offsetLeft) * direction,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

slideRight?.addEventListener("click", () => scrollRealizations(1));
slideLeft?.addEventListener("click", () => scrollRealizations(-1));

function updateControls() {
  if (!realizationList || !slideLeft || !slideRight) return;
  slideLeft.disabled = realizationList.scrollLeft <= 1;
  slideRight.disabled = realizationList.scrollLeft >= realizationList.scrollWidth - realizationList.clientWidth - 1;
}

if (realizationList) {
  realizationList.addEventListener("scroll", updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(realizationList);
  realizationList.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      scrollRealizations(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  updateControls();
}
