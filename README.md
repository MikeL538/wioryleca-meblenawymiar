# Wiory Leca - Meble na Wymiar

Business website for a custom furniture workshop, presenting the offer, completed projects, and quick contact options for potential clients.

Live: [www.wioryleca-meblenawymiar.pl](https://www.wioryleca-meblenawymiar.pl/)

## About

Commercial portfolio and business website for a local carpentry company. The site combines a landing page with offer sections, selected realizations, cooperation details, and a separate project gallery page filtered by categories: kitchens, wardrobes, bathrooms, and built-ins.

## Scope

- responsive layout for mobile, tablet, and desktop
- dynamically generated project gallery based on selected category
- gallery pagination
- modals for menu, contact, cooperation, company information, and image preview
- URL parameter handling for project filtering
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

Language links in the desktop header and mobile menu retain query parameters (including the selected gallery category) and the URL fragment. Polish remains the default; there are no automatic language redirects. Each page includes its own canonical URL, translated metadata, `lang`, reciprocal `hreflang` links and an `x-default` pointing to Polish. The sitemap lists all six pages.

Translations live in `src/locales/`, grouped into `pages`, `partials` and `runtime`, each with `pl.json`, `de.json` and `en.json`. Edit the matching key in all three languages. Static templates use `{{t:key}}`; runtime code uses `t("runtime.key")`. Text values are escaped automatically, so keep HTML in the templates. Missing keys and mismatched dictionaries fail the build.

`index.html`, `projects.html` and `src/partials/` are shared templates. The four files under `de/` and `en/` are small entry points that include those templates. `build/i18n.mjs` renders the translations and locale-specific navigation; the Vite plugin applies this in development and production. The contact API payload is unchanged; client-side validation and success/error messages follow the current language.

Run the build and localization checks with:

```bash
npm run test:i18n
```

Tests check all six built pages, SEO links, assets, escaping, language switching, gallery categories and form messages. Contact requests are mocked; tests do not send email.

## For Recruiters

This project demonstrates practical production website work: a multi-page Vite build, modular HTML partials, component-oriented SCSS, TypeScript-driven UI interactions, and a gallery system built without a frontend framework. The codebase uses a lightweight structure suited to the project's scale and easy to extend further.

Key technical areas:

- `vite.config.ts` generates six language-specific pages from the two shared templates
- `src/ts/imagesGenerator.ts` generates the gallery, pagination, and category state
- `src/ts/modals.ts` centralizes text modal logic
- `src/ts/modalImage.ts` handles the image preview modal
- `src/styles/` separates styles by view and breakpoint
