import { refreshLanguageLinks } from "./i18n";

// Update years
function updateYears() {
  const currentYear = new Date().getFullYear();
  const experienceYears = document.querySelector<HTMLElement>(
    "#why-weExperienceYears",
  );
  const footerCopyYear = document.querySelector<HTMLElement>("#footerCopyYear");

  if (experienceYears) {
    experienceYears.textContent = (currentYear - 2018).toString();
  }

  if (footerCopyYear) {
    footerCopyYear.textContent = currentYear.toString();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateYears);
} else {
  updateYears();
}

refreshLanguageLinks();
window.addEventListener("hashchange", refreshLanguageLinks);
window.addEventListener("popstate", refreshLanguageLinks);
