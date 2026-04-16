const projectList = document.querySelector<HTMLUListElement>("#projectList");
const wardrobeButton =
  document.querySelector<HTMLButtonElement>("#wardrobeButton");
const amountWardrobe: number = 31;
const name: string = "szafa";

function imageGenerate(amount: number, name: string) {
  if (projectList) {
    projectList.innerHTML = "";

    for (let i: number = 1; i <= amount; i++) {
      projectList.innerHTML += `
        <li class="projects__list-item">
            <button class="projects__list-button" type="button" >
              <img
                class="projects__list-img"
                src="/images/wardrobes/${name}${i}.webp"
                alt="Projekt mebli na wymiar"
              />
            </button>
        </li>
    `;
    }
  }
}

wardrobeButton.addEventListener("click", () => {
  imageGenerate(amountWardrobe, name);
});
