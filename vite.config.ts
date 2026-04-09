import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: new URL("./index.html", import.meta.url).pathname,
        projects: new URL("./projects.html", import.meta.url).pathname,
      },
    },
  },
});
