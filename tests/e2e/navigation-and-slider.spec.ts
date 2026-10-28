import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  page.on("pageerror", error => { throw error; });
});

test("carousel supports buttons, keyboard, edge states and resizing with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const list = page.locator("#realizationList");
  const left = page.locator("#realizationArrowLeft");
  const right = page.locator("#realizationArrowRight");
  await expect(left).toBeDisabled();
  await expect(right).toBeEnabled();
  await right.click();
  await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  await expect(left).toBeEnabled();
  await list.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(left).toBeDisabled();
  await list.evaluate(el => { el.scrollLeft = el.scrollWidth; });
  await expect(right).toBeDisabled();
  await page.setViewportSize({ width: 768, height: 900 });
  await left.click();
  await expect(right).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("active navigation and language switching follow category and pagination", async ({ page }) => {
  for (const language of ["pl", "en", "de"]) {
    const prefix = language === "pl" ? "" : `/${language}`;
    await page.goto(`${prefix}/`);
    await expect(page.locator('.header [data-nav-page="home"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('.header [data-nav-page="projects"]')).not.toHaveAttribute("aria-current");
    await page.goto(`${prefix}/projects/wardrobe-2.html`);
    await expect(page.locator('.header [data-nav-page="projects"]')).toHaveAttribute("aria-current", "location");
    await expect(page.locator('.header [data-nav-page="home"]')).not.toHaveAttribute("aria-current");
    const menuButton = page.locator('[data-modal-open="menu"]');
    if (await menuButton.isVisible()) await menuButton.click();
    const nav = page.locator(await menuButton.isVisible() ? '#modalMenu' : '.header');
    await expect(nav.locator('[data-nav-page="projects"]')).toHaveCSS("text-decoration-line", "underline");
    await expect(nav.locator(`[data-language-link="${language}"]`)).toHaveAttribute("aria-current", "page");
    await expect(nav.locator(`[data-language-link="${language}"]`)).toHaveCSS("border-top-width", "0px");
    const nextLanguage = language === "en" ? "de" : "en";
    await nav.locator(`[data-language-link="${nextLanguage}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${nextLanguage}/projects/wardrobe-2.html$`));
    await expect(page.locator('html')).toHaveAttribute("lang", nextLanguage);
  }
});

test("skip link moves keyboard focus directly to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('#mainContent')).toBeFocused();
});
