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

## For Recruiters

This project demonstrates practical production website work: a multi-page Vite build, modular HTML partials, component-oriented SCSS, TypeScript-driven UI interactions, and a gallery system built without a frontend framework. The codebase uses a lightweight structure suited to the project's scale and easy to extend further.

Key technical areas:

- `vite.config.ts` handles two entry points: `index.html` and `projects.html`
- `src/ts/imagesGenerator.ts` generates the gallery, pagination, and category state
- `src/ts/modals.ts` centralizes text modal logic
- `src/ts/modalImage.ts` handles the image preview modal
- `src/styles/` separates styles by view and breakpoint
