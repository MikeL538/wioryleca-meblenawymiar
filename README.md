# Wiory Leca - Meble na Wymiar

Business website for a custom furniture workshop, presenting the offer, completed projects, and quick contact options for potential clients.

Live: [www.wioryleca-meblenawymiar.pl](https://www.wioryleca-meblenawymiar.pl/)

## About

Commercial portfolio and business website for a local carpentry company. The site combines a landing page with offer sections, selected realizations, cooperation details, and a separate project gallery page filtered by categories: kitchens, wardrobes, bathrooms, and built-ins.

## Scope

- responsive layout for mobile, tablet, and desktop
- static project gallery with category pages and crawlable pagination
- modals for menu, contact, cooperation, company information, and image preview
- compatibility redirects for old category query links
- HTML partial integration through a custom Vite plugin
- static asset preparation for production deployment

## Stack

- HTML
- SCSS
- TypeScript
- Vite

## Local Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Build preview:

```bash
npm run preview
```

## Languages / Języki

The site generates complete HTML pages in Polish, German and English at build time:

| Language | Home | Projects |
| --- | --- | --- |
| Polski | `/` | `/projects.html` |
| Deutsch | `/de/` | `/de/projects.html` |
| English | `/en/` | `/en/projects.html` |

Language links in the desktop header and mobile menu retain the page, query parameters and URL fragment. Polish remains the default; there are no automatic language redirects. Each page includes its own canonical URL, translated metadata, `lang`, reciprocal `hreflang` links and an `x-default` pointing to Polish. The sitemap is generated from the same route catalogue as the HTML build; currently it lists 27 pages and all 104 gallery photos.

Category URLs are `/projects/kitchen.html`, `/projects/wardrobe.html`, `/projects/bathroom.html` and `/projects/built-in.html`, with `/en` or `/de` prefixes for translations. Subsequent pages use `-2`, `-3`, etc., for example `/en/projects/wardrobe-2.html`. Each page contains up to 20 photos on all screen sizes and works without JavaScript. The `/projects.html` hub shows selected photos from all categories. Old links such as `/projects.html?category=kitchen` navigate to the corresponding static page when JavaScript is enabled; without it the hub still offers working category links.

Translations live in `src/locales/`, grouped into `pages`, `partials` and `runtime`, each with `pl.json`, `de.json` and `en.json`. Edit the matching key in all three languages. Static templates use `{{t:key}}`; runtime code uses `t("runtime.key")`. Text values are escaped automatically, so keep HTML in the templates. Missing keys and mismatched dictionaries fail the build.

`index.html`, `projects.html` and `src/partials/` are shared templates. The four files under `de/` and `en/` are small entry points that include those templates. `build/i18n.mjs` renders the translations and locale-specific navigation; `build/seo.mjs` renders metadata, structured data, gallery HTML and the sitemap. The Vite plugin applies these in development and production. The contact API payload is unchanged; client-side validation and success/error messages follow the current language.

`build/catalog.mjs` discovers numbered WebP files in the existing image folders. Vite generates the ignored HTML entry points under `projects/`, `en/projects/` and `de/projects/`; do not edit those generated files. Add photos to `public/images/` using the existing filename patterns, then restart Vite or rebuild to refresh the catalogue and routes. Image dimensions are read from the actual assets during rendering.

The workshop address is private. Organization structured data includes public contact information, social profiles and service areas, without an address, coordinates or fabricated ratings. For deployment checks and external indexing steps, see [SEO_REPORT.md](SEO_REPORT.md).

Run the build and localization checks with:

```bash
npm run test:i18n
```

These checks cover all built pages, SEO metadata and structured data, privacy of business details, internal links, assets, escaping, language switching, complete gallery coverage and sitemap consistency. Form behavior and navigation without JavaScript are covered by the browser tests below.

## Browser tests

Install the test browser once, then run the complete suite:

```bash
npx playwright install chromium
npm test
```

`npm test` builds the production site, runs the Node tests, then starts a local preview for Playwright. Browser tests cover desktop and mobile Chromium, translated inline form validation, Enter submission, duplicate requests, API/network errors, timeouts, modal focus and gallery controls. External requests are blocked or mocked; tests never send real email.

To run only browser tests against an existing build: `npm run test:e2e`. Port 4173 must be available. Failure screenshots and traces are saved in the ignored `test-results/` directory.

On Windows with restricted access to the default browser cache, use PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.cache/ms-playwright'
npx.cmd playwright install chromium
npm.cmd test
```

GitHub Actions builds and tests pull requests and pushes to `main`. Publishing runs only for `main`, after all tests pass. See [QA_REPORT.md](QA_REPORT.md) for the manual verification checklist.

## For Recruiters

This project demonstrates practical production website work: a multi-page Vite build, modular HTML partials, component-oriented SCSS, TypeScript-driven UI interactions, and a gallery system built without a frontend framework. The codebase uses a lightweight structure suited to the project's scale and easy to extend further.

Key technical areas:

- `vite.config.ts` generates language-specific pages from two shared templates and the image catalogue
- `build/catalog.mjs` and `build/seo.mjs` generate the gallery, pagination, metadata and sitemap
- `src/ts/galleryNavigation.ts` preserves old category links
- `src/ts/modals.ts` centralizes text modal logic
- `src/ts/modalImage.ts` handles the image preview modal
- `src/styles/` separates styles by view and breakpoint
