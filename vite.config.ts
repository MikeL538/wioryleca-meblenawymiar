import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { languages, pages, renderHtml, rootPath } from "./build/i18n.mjs";
import { galleryRoutes } from "./build/catalog.mjs";
import { sitemap } from "./build/seo.mjs";

// Vite's HTML entry points are generated from the actual image catalogue.
for (const language of languages) {
  for (const page of Object.keys(galleryRoutes)) {
    const entry = resolve(rootPath, language === "pl" ? page : `${language}/${page}`);
    mkdirSync(dirname(entry), { recursive: true });
    writeFileSync(entry, '<include src="./projects.html"></include>\n');
  }
}

function localizedHtml(): Plugin {
  return {
    name: "localized-html",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const path = context.path.split("?")[0];
        const language = path.startsWith("/de/") ? "de" : path.startsWith("/en/") ? "en" : "pl";
        const relative = path.replace(/^\/(?:de\/|en\/)?/, "");
        const page = relative === "" ? "index.html" : relative;
        return renderHtml(html, language, page);
      },
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap() });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/sitemap.xml") return next();
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.end(sitemap());
      });
    },
    handleHotUpdate({ file, server }) {
      const path = file.replaceAll("\\", "/");
      if (path.includes("/src/locales/") || path.includes("/src/partials/") || path.endsWith("/index.html") || path.endsWith("/projects.html")) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  appType: "mpa",
  base: "/",
  plugins: [localizedHtml()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(languages.flatMap((language: string) => pages.map((page: string) => [
        `${language}-${page}`,
        resolve(rootPath, language === "pl" ? page : `${language}/${page}`),
      ]))),
    },
  },
});
