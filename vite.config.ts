import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { resolve } from "node:path";
import { languages, pages, renderHtml, rootPath } from "./build/i18n.mjs";

function localizedHtml(): Plugin {
  return {
    name: "localized-html",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const path = context.path.split("?")[0];
        const language = path.startsWith("/de/") ? "de" : path.startsWith("/en/") ? "en" : "pl";
        const page = path.endsWith("projects.html") ? "projects.html" : "index.html";
        return renderHtml(html, language, page);
      },
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
