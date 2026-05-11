const projectList =
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

const DEFAULT_CATEGORY: ProjectCategory = "kitchen";

let PROJECTS_PER_PAGE = 12;

const bodyWidth = document.body.clientWidth;

if (bodyWidth >= 768) PROJECTS_PER_PAGE = 16;
if (bodyWidth >= 1080) PROJECTS_PER_PAGE = 20;

let currentPage = 1;

function imageGenerate(
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
            <button data-modal-open="image" class="projects__list-button" type="button" >
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

function isProjectCategory(
  category: string | null,
): category is ProjectCategory {
  return Boolean(category && category in projectConfig);
}

function setActiveCategoryButton(category: ProjectCategory) {
  categoryButtons.forEach((button) => {
    const isActive = button.dataset.category === category;

    button.classList.toggle("categories__button--active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function updateCategoryInUrl(category: ProjectCategory) {
  const url = new URL(window.location.href);
  url.searchParams.set("category", category);
  window.history.replaceState({}, "", url);
}

function renderCategory(category: string | null, page = 1) {
  const selectedCategory = isProjectCategory(category)
    ? category
    : DEFAULT_CATEGORY;
  const config = projectConfig[selectedCategory];

  setActiveCategoryButton(selectedCategory);
  imageGenerate(config.amount, config.imageName, config.imageFolder, page);
}

if (categoryButtons.length) {
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category ?? null;

      if (isProjectCategory(category)) {
        updateCategoryInUrl(category);
        renderCategory(category);
      }
    });
  });
}

const selectedCategory = new URLSearchParams(window.location.search).get(
  "category",
);

if (!isProjectCategory(selectedCategory)) {
  updateCategoryInUrl(DEFAULT_CATEGORY);
}

renderCategory(selectedCategory);
