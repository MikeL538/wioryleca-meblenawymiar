export const projectList =
  document.querySelector<HTMLUListElement>("#projectList");
const projectPagination =
  document.querySelector<HTMLElement>("#projectPagination");
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
    amount: 41,
    imageName: "szafa",
    imageFolder: "wardrobes",
  },
  kitchen: {
    amount: 29,
    imageName: "kuchnia",
    imageFolder: "kitchen",
  },
  bathroom: {
    amount: 17,
    imageName: "Lazienka",
    imageFolder: "bathroom",
  },
  "built-in": {
    amount: 17,
    imageName: "zab",
    imageFolder: "other",
  },
};

export const amountWardrobe: number = projectConfig.wardrobe.amount;
export const name: string = projectConfig.wardrobe.imageName;

let PROJECTS_PER_PAGE = 12;

const bodyWidth = document.body.clientWidth;

if (bodyWidth >= 768) PROJECTS_PER_PAGE = 16;
if (bodyWidth >= 1080) PROJECTS_PER_PAGE = 20;

let currentPage = 1;

export function imageGenerate(
  amount: number,
  name: string,
  imageFolder = "wardrobes",
  page = 1,
) {
  if (projectList) {
    projectList.innerHTML = "";

    if (!amount || !name || !imageFolder) {
      projectList.innerHTML = `
        <li class="projects__list-item">
          <p>Zdjecia dla tej kategorii beda dodane wkrotce.</p>
        </li>
      `;
      if (projectPagination) {
        projectPagination.innerHTML = "";
      }
      return;
    }

    const totalPages = Math.ceil(amount / PROJECTS_PER_PAGE);
    currentPage = Math.min(Math.max(page, 1), totalPages);

    const firstProject = (currentPage - 1) * PROJECTS_PER_PAGE + 1;
    const lastProject = Math.min(currentPage * PROJECTS_PER_PAGE, amount);

    for (let i: number = firstProject; i <= lastProject; i++) {
      projectList.insertAdjacentHTML(
        "beforeend",
        `
        <li class="projects__list-item">
            <button class="projects__list-button" type="button" >
              <img
                class="projects__list-img"
                src="/images/${imageFolder}/${name}${i}.webp"
                alt="Projekt mebli na wymiar"
              />
            </button>
        </li>
    `,
      );
    }

    renderPagination(amount, name, imageFolder);
  }
}

function renderPagination(amount: number, name: string, imageFolder: string) {
  if (!projectPagination) {
    return;
  }

  const totalPages = Math.ceil(amount / PROJECTS_PER_PAGE);

  if (totalPages <= 1) {
    projectPagination.innerHTML = "";
    return;
  }

  const paginationButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const isActive = page === currentPage;

    return `
      <button
        class="projects__pagination-button${isActive ? " projects__pagination-button--active" : ""}"
        type="button"
        data-page="${page}"
        aria-label="Strona ${page}"
        ${isActive ? 'aria-current="page"' : ""}
      >
        ${page}
      </button>
    `;
  }).join("");

  projectPagination.innerHTML = `
    <button
      class="projects__pagination-button"
      type="button"
      data-page="${currentPage - 1}"
      ${currentPage === 1 ? "disabled" : ""}
      aria-label="Poprzednia strona"
    >
      &lt;
    </button>
    ${paginationButtons}
    <button
      class="projects__pagination-button"
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage === totalPages ? "disabled" : ""}
      aria-label="Nastepna strona"
    >
      &gt;
    </button>
  `;

  projectPagination
    .querySelectorAll<HTMLButtonElement>(".projects__pagination-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const selectedPage = Number(button.dataset.page);

        if (!Number.isNaN(selectedPage)) {
          imageGenerate(amount, name, imageFolder, selectedPage);
          projectList?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
}

function renderCategory(category: string | null, page = 1) {
  if (!category) {
    imageGenerate(
      projectConfig.wardrobe.amount,
      projectConfig.wardrobe.imageName,
      projectConfig.wardrobe.imageFolder,
      page,
    );
    return;
  }

  const config = projectConfig[category as ProjectCategory];

  if (!config) {
    return;
  }

  imageGenerate(config.amount, config.imageName, config.imageFolder, page);
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
