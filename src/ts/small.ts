const experienceYears = document.querySelector("#why-weExperienceYears");

document.addEventListener("DOMContentLoaded", () => {
  const date = new Date();
  const exp = date.getFullYear() - 2010;

  if (experienceYears) experienceYears.textContent = exp.toString();
});
