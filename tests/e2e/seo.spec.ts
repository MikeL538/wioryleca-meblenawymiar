import { test, expect } from "@playwright/test";
// @ts-expect-error Build helpers are plain ESM shared with the Vite configuration.
import { pages, pagePath, siteUrl } from "../../build/seo.mjs";
// @ts-expect-error Build catalogue is plain ESM, not client code.
import { imagesForPage, categories } from "../../build/catalog.mjs";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", (route) => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  page.on("pageerror", (error) => { throw error; });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const language of ["pl", "en", "de"]) {
    test(`${language}: every page loads with headings, canonical metadata and gallery content`, async ({ page }) => {
      for (const route of pages) {
        const response = await page.goto(pagePath(language, route));
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", siteUrl + pagePath(language, route));
        if (route !== "index.html") {
          await expect(page.locator("#projectList img")).toHaveCount(imagesForPage(route).length);
          await expect(page.locator('.categories a[href]')).toHaveCount(4);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    });
  }

  test("category, pagination and image links work without JavaScript", async ({ page }) => {
    await page.goto("/projects.html");
    await page.locator('.categories a[href="/projects/wardrobe.html"]').click();
    await expect(page).toHaveURL(/\/projects\/wardrobe\.html$/);
    await page.locator('#projectPagination a[href="/projects/wardrobe-2.html"]').click();
    await expect(page).toHaveURL(/\/projects\/wardrobe-2\.html$/);
    await expect(page.locator("#projectList img").first()).toHaveAttribute("src", "/images/wardrobes/szafa21.webp");
    await page.locator("#projectList a").first().click();
    await expect(page).toHaveURL(/\/images\/wardrobes\/szafa21.webp$/);
  });
});

for (const language of ["pl", "en", "de"]) {
  test(`${language}: legacy category URLs resolve to static pages`, async ({ page }) => {
    for (const category of categories) {
      await page.goto(`${pagePath(language, "projects.html")}?category=${category}&source=test#projects`);
      await expect(page).toHaveURL(`http://127.0.0.1:4173${pagePath(language, `projects/${category}.html`)}?source=test#projects`);
      await expect(page.locator("#projectList img")).toHaveCount(imagesForPage(`projects/${category}.html`).length);
    }
    for (const invalid of ["constructor", "__proto__", "missing"]) {
      await page.goto(`${pagePath(language, "projects.html")}?category=${invalid}`);
      await expect(page.locator("#projectList img")).toHaveCount(8);
    }
  });
}

test("pagination survives reload/back and language switching retains the same page", async ({ page }) => {
  await page.goto("/projects/wardrobe.html");
  await page.locator('#projectPagination a[href="/projects/wardrobe-2.html"]').click();
  await expect(page.locator("#projectList img").first()).toHaveAttribute("src", "/images/wardrobes/szafa21.webp");
  await page.reload();
  await expect(page.locator('#projectPagination [aria-current="page"]')).toHaveText("2");
  const languageLink = page.locator('a[data-language-link="en"]').first();
  const target = await languageLink.getAttribute("href");
  expect(target).toBe("/en/projects/wardrobe-2.html");
  await page.goto(target!);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#projectList img").first()).toHaveAttribute("src", "/images/wardrobes/szafa21.webp");
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/wardrobe-2.html$/);
});

test("invalid paths return 404 and the custom error page is not indexable", async ({ page, request }) => {
  const response = await request.get("/this-page-does-not-exist.html");
  expect(response.status()).toBe(404);
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
});
