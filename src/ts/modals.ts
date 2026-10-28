import { openDialog } from "./modalController";

for (const name of ["Menu", "Coop", "Contact", "About"]) {
  const modal = document.querySelector<HTMLElement>(`#modal${name}`);
  if (!modal) continue;
  document.querySelectorAll<HTMLElement>(`[data-modal-open="${name.toLowerCase()}"]`)
    .forEach((button) => {
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", modal.id);
      button.addEventListener("click", () => openDialog(modal, button));
    });
}
