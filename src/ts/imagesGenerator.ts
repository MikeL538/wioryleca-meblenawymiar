export const projectList =
  document.querySelector<HTMLUListElement>("#projectList");
const categoryButtons = document.querySelectorAll<HTMLButtonElement>(
  ".categories__button[data-category]",
);

type ProjectCategory = "wardrobe" | "kitchen" | "bathroom" | "built-in";

type ProjectConfig = {
  amount: number;
  imageName: string;
  imageFolder: string;
};

const projectConfig: Record<ProjectCategory, ProjectConfig> = {
  wardrobe: {
    amount: 35,
    imageName: "szafa",
    imageFolder: "wardrobes",
  },
  kitchen: {
    amount: 14,
    imageName: "kuchnia",
    imageFolder: "kitchen",
  },
  bathroom: {
    amount: 8,
    imageName: "Lazienka",
    imageFolder: "bathroom",
  },
  "built-in": {
    amount: 12,
    imageName: "zab",
    imageFolder: "other",
  },
};

export const amountWardrobe: number = projectConfig.wardrobe.amount;
export const name: string = projectConfig.wardrobe.imageName;

export function imageGenerate(
  amount: number,
  name: string,
  imageFolder = "wardrobes",
) {
  if (projectList) {
    projectList.innerHTML = "";

    if (!amount || !name || !imageFolder) {
      projectList.innerHTML = `
        <li class="projects__list-item">
          <p>Zdjecia dla tej kategorii beda dodane wkrotce.</p>
        </li>
      `;
      return;
    }

    for (let i: number = 1; i <= amount; i++) {
      projectList.innerHTML += `
        <li class="projects__list-item">
            <button class="projects__list-button" type="button" >
              <img
                class="projects__list-img"
                src="/images/${imageFolder}/${name}${i}.webp"
                alt="Projekt mebli na wymiar"
              />
            </button>
        </li>
    `;
    }
  }
}

function renderCategory(category: string | null) {
  if (!category) {
    imageGenerate(
      projectConfig.wardrobe.amount,
      projectConfig.wardrobe.imageName,
      projectConfig.wardrobe.imageFolder,
    );
    return;
  }

  const config = projectConfig[category as ProjectCategory];

  if (!config) {
    return;
  }

  imageGenerate(config.amount, config.imageName, config.imageFolder);
}

if (categoryButtons.length) {
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category ?? null;

      if (category) {
        const url = new URL(window.location.href);
        url.searchParams.set("category", category);
        window.history.replaceState({}, "", url);
      }

      renderCategory(category);
    });
  });
}

const selectedCategory = new URLSearchParams(window.location.search).get(
  "category",
);
renderCategory(selectedCategory);

// document.addEventListener('DOMContentLoaded', () => {
//   if (selectedCategory == )
// })
