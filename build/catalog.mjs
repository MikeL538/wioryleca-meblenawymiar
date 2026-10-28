import { readdirSync } from "node:fs";

export const pageSize = 20;
export const categoryConfig = {
  kitchen: { folder: "kitchen", prefix: "kuchnia", icon: "kitchen" },
  wardrobe: { folder: "wardrobes", prefix: "szafa", icon: "wardrobe" },
  bathroom: { folder: "bathroom", prefix: "Lazienka", icon: "bathroom" },
  "built-in": { folder: "other", prefix: "zab", icon: "drawer" },
};
export const categories = Object.keys(categoryConfig);
export const catalog = Object.fromEntries(categories.map((category) => {
  const { folder, prefix } = categoryConfig[category];
  const images = readdirSync(new URL(`../public/images/${folder}/`, import.meta.url))
    .filter((file) => new RegExp(`^${prefix}\\d+\\.webp$`).test(file))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((file) => `/images/${folder}/${file}`);
  if (!images.length) throw new Error(`Empty gallery category: ${category}`);
  return [category, images];
}));

export function categoryPage(category, page = 1) {
  return `projects/${category}${page > 1 ? `-${page}` : ""}.html`;
}

export const galleryRoutes = Object.fromEntries(categories.flatMap((category) =>
  Array.from({ length: Math.ceil(catalog[category].length / pageSize) }, (_, index) => [
    categoryPage(category, index + 1), { category, number: index + 1 },
  ]),
));

export function imagesForPage(page) {
  const route = galleryRoutes[page];
  if (route) return catalog[route.category].slice((route.number - 1) * pageSize, route.number * pageSize);
  if (page === "projects.html") return categories.flatMap((category) => catalog[category].slice(0, 2));
  return [];
}
