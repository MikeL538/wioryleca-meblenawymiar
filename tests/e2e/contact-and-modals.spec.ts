import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const endpoint = "https://server.wioryleca-meblenawymiar.pl/send-email";
const valid = { Name: "Test", Localization: "City", Contact: "test@example.test", Message: "Test message", Preferable: "" };

async function fillForm(page: Page) {
  for (const [field, value] of Object.entries(valid)) await page.locator(`#contact${field}`).fill(` ${value} `);
}

async function openContact(page: Page) {
  await page.locator('.hero [data-modal-open="contact"]').click();
  await expect(page.locator("#modalContact")).toBeVisible();
}

test.beforeEach(async ({ context, page }) => {
  // No test may send real mail. Individual tests override this with mock responses.
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).hostname === "127.0.0.1") return route.continue();
    return route.abort();
  });
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
    throw new Error(`Unexpected browser alert: ${dialog.message()}`);
  });
  page.on("pageerror", (error) => { throw error; });
});

for (const locale of ["pl", "en", "de"]) {
  const path = locale === "pl" ? "/" : `/${locale}/`;
  const messages = JSON.parse(readFileSync(`src/locales/runtime/${locale}.json`, "utf8"));

  test(`${locale}: inline validation, field limits, Enter submission and email links`, async ({ page }) => {
    let requests = 0;
    await page.route(endpoint, (route) => {
      requests++;
      expect(route.request().postDataJSON()).toEqual({
        name: valid.Name, localization: valid.Localization, contact: valid.Contact,
        message: valid.Message, preferable: valid.Preferable,
      });
      return route.fulfill({ status: 200, body: "{}", contentType: "application/json" });
    });
    await page.goto(path);
    for (const link of await page.locator('a[href^="mailto:"]').all()) {
      expect(await link.getAttribute("href")).toBe(`mailto:${(await link.textContent())?.trim()}`);
    }
    await openContact(page);
    await fillForm(page);
    for (const field of ["Name", "Localization", "Contact", "Message"]) {
      await page.locator(`#contact${field}`).fill("   ");
      await page.locator("#contactButton").click();
      await expect(page.locator(`#contact${field}Error`)).toHaveText(messages["runtime.contact.required"]);
      await expect(page.locator(`#contact${field}`)).toBeFocused();
      expect(requests).toBe(0);
      await fillForm(page);
    }
    for (const [field, limit, key] of [
      ["Name", 100, "nameTooLong"], ["Localization", 100, "locationTooLong"],
      ["Contact", 100, "detailsTooLong"], ["Message", 2500, "messageTooLong"],
      ["Preferable", 250, "preferenceTooLong"],
    ] as const) {
      // Autofill/programmatic values can bypass the HTML maxlength.
      await page.locator(`#contact${field}`).evaluate((input, value) => {
        (input as HTMLInputElement).value = value;
      }, "x".repeat(limit + 1));
      await page.locator("#contactButton").click();
      await expect(page.locator(`#contact${field}Error`)).toHaveText(messages[`runtime.contact.${key}`]);
      expect(requests).toBe(0);
      await fillForm(page);
    }
    await page.locator("#contactName").press("Enter");
    await expect(page.locator("#contactStatus")).toHaveText(messages["runtime.contact.sent"]);
    await expect(page.locator("#contactName")).toHaveValue("");
    expect(requests).toBe(1);
  });

  test(`${locale}: duplicate requests blocked, failure preserves values, retry succeeds`, async ({ page }) => {
    let requests = 0;
    let finishRequest: () => void = () => {};
    const pendingResponse = new Promise<void>((resolve) => { finishRequest = resolve; });
    await page.route(endpoint, async (route) => {
      requests++;
      await pendingResponse;
      await route.fulfill({ status: 503, body: "Unavailable" });
    });
    await page.goto(path);
    await openContact(page);
    await fillForm(page);
    const button = page.locator("#contactButton");
    const label = await button.textContent();
    await button.click();
    await expect(button).toBeDisabled();
    await expect(button).toHaveText(messages["runtime.contact.sending"]);
    await expect(page.locator("#contactForm")).toHaveAttribute("aria-busy", "true");
    await page.locator("#contactForm").evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
      (form as HTMLFormElement).requestSubmit();
    });
    await expect.poll(() => requests).toBe(1);
    await page.keyboard.press("Escape");
    await openContact(page);
    await expect(button).toBeDisabled();
    finishRequest();
    await expect(page.locator("#contactStatus")).toHaveText(messages["runtime.contact.sendFailed"]);
    await expect(button).toBeEnabled();
    await expect(button).toHaveText(label!);
    await expect(page.locator("#contactMessage")).toHaveValue(` ${valid.Message} `);
    expect(requests).toBe(1);
    await page.unroute(endpoint);
    await page.route(endpoint, (route) => route.abort("failed"));
    await button.click();
    await expect(page.locator("#contactStatus")).toHaveText(messages["runtime.contact.sendFailed"]);
    await expect(button).toBeEnabled();
    await page.unroute(endpoint);
    await page.route(endpoint, (route) => route.fulfill({ status: 200, body: "{}" }));
    await button.click();
    await expect(page.locator("#contactStatus")).toHaveText(messages["runtime.contact.sent"]);
  });

  test(`${locale}: timeout restores editing and preserves the message`, async ({ page }) => {
    await page.clock.install();
    await page.route(endpoint, () => {});
    await page.goto(path);
    await openContact(page);
    await fillForm(page);
    await page.locator("#contactButton").click();
    await expect(page.locator("#contactButton")).toBeDisabled();
    await page.clock.fastForward(15_001);
    await expect(page.locator("#contactStatus")).toHaveText(messages["runtime.contact.timeout"]);
    await expect(page.locator("#contactButton")).toBeEnabled();
    await expect(page.locator("#contactMessage")).toHaveValue(` ${valid.Message} `);
  });
}

test("dialogs trap focus, isolate background, close on Escape/backdrop and restore focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator('.hero [data-modal-open="contact"]');
  await openContact(page);
  const close = page.locator("#modalContact .modal__close");
  await expect(close).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#contactButton")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator(".modal__backdrop.is-open")).toHaveCount(0);
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveClass(/modal-open/);
  await openContact(page);
  await page.locator("#modalContact").click({ position: { x: 2, y: 2 } });
  await expect(trigger).toBeFocused();
  await expect(page.locator(".modal__backdrop.is-open")).toHaveCount(0);
});

test("mobile menu switches to one dialog and returns focus to its original trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.locator('[data-modal-open="menu"]');
  for (const [name, id] of [["contact", "Contact"], ["about", "About"], ["coop", "Coop"]]) {
    await menuButton.click();
    await page.locator(`#modalMenu [data-modal-open="${name}"]`).click();
    await expect(page.locator(".modal__backdrop.is-open")).toHaveCount(1);
    await expect(page.locator("#modalMenu")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(`#modal${id} .modal__close`)).toBeFocused();
    await expect(page.locator("body")).toHaveClass(/modal-open/);
    await page.locator(`#modal${id} .modal__close`).click();
    await expect(menuButton).toBeFocused();
    await expect(page.locator("body")).not.toHaveClass(/modal-open/);
  }
});

test("gallery wraps without alerts, supports arrows and restores focus", async ({ page }) => {
  await page.goto("/projects/bathroom.html");
  const photos = page.locator('#projectList [data-modal-open="image"]');
  const firstSrc = await photos.first().locator("img").getAttribute("src");
  const lastSrc = await photos.last().locator("img").getAttribute("src");
  await photos.last().click();
  await expect(page.locator("#modalImageCounter")).toHaveText(`${await photos.count()} / ${await photos.count()}`);
  await expect(page.locator("#modalImage .modal__close")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#modalImageCounter")).toHaveText(`1 / ${await photos.count()}`);
  await expect(page.locator("#modalImageSrc")).toHaveAttribute("src", `http://127.0.0.1:4173${firstSrc}`);
  await page.locator("#modalImageLeft").click();
  await expect(page.locator("#modalImageSrc")).toHaveAttribute("src", `http://127.0.0.1:4173${lastSrc}`);
  await page.keyboard.press("Escape");
  await expect(photos.last()).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/modal-open/);
});
