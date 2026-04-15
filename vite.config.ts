import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const includePattern =
  /<include\s+src=(["'])(?<src>.*?)\1\s*>\s*<\/include>/g;
const rootPath = fileURLToPath(new URL(".", import.meta.url));

function htmlPartials() {
  return {
    name: "html-partials",
    transformIndexHtml(html: string) {
      return html.replace(includePattern, (_match, _quote, src: string) => {
        const partialPath = resolve(rootPath, src);

        return readFileSync(partialPath, "utf-8");
      });
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        projects: fileURLToPath(
          new URL("./src/partials/projects.html", import.meta.url),
        ),
      },
    },
  },
});
