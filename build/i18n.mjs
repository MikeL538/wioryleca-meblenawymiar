import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const rootPath = fileURLToPath(new URL("../", import.meta.url));
export const siteUrl = "https://www.wioryleca-meblenawymiar.pl";
export const languages = ["pl", "de", "en"];
export const pages = ["index.html", "projects.html"];
const groups = ["pages", "partials", "runtime"];
const tokenPattern = /\{\{t:([\w.]+)\}\}/g;

export function pagePath(language, page) {
  const prefix = language === "pl" ? "/" : `/${language}/`;
  return prefix + (page === "index.html" ? "" : page);
}

export function readDictionaries() {
  const dictionaries = {};
  for (const language of languages) {
    const dictionary = {};
    for (const group of groups) {
      const entries = JSON.parse(
        readFileSync(
          resolve(rootPath, `src/locales/${group}/${language}.json`),
          "utf8",
        ),
      );
      for (const [key, value] of Object.entries(entries)) {
        if (
          Object.hasOwn(dictionary, key) ||
          typeof value !== "string" ||
          !value.trim()
        ) {
          throw new Error(
            `Invalid or duplicate translation: ${language}/${key}`,
          );
        }
        dictionary[key] = value;
      }
    }
    dictionaries[language] = dictionary;
  }
  const expected = Object.keys(dictionaries.pl).sort().join("\n");
  for (const language of languages) {
    if (Object.keys(dictionaries[language]).sort().join("\n") !== expected) {
      throw new Error(`Translation keys do not match Polish: ${language}`);
    }
  }
  return dictionaries;
}

export function expandPartials(html, ancestors = []) {
  return html.replace(
    /<include\s+src=(["'])(.*?)\1\s*>\s*<\/include>/g,
    (_match, _quote, source) => {
      const path = resolve(rootPath, source);
      if (ancestors.includes(path))
        throw new Error(`Circular HTML include: ${source}`);
      return expandPartials(readFileSync(path, "utf8"), [...ancestors, path]);
    },
  );
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function languageSwitcher(language, page, label) {
  const names = { pl: "Polski", de: "Deutsch", en: "English" };
  const flags = { pl: "poland", de: "germany", en: "uk" };
  return `<div class="language-switcher" role="group" aria-label="${escapeHtml(label)}">
    ${languages
      .map(
        (
          target,
        ) => `<a class="language-switcher__link" data-language-link="${target}" href="${pagePath(target, page)}" hreflang="${target}" lang="${target}" aria-label="${names[target]}"${target === language ? ' aria-current="page"' : ""}>
      <svg width="28" height="20" aria-hidden="true"><use href="/icons.svg#${flags[target]}"></use></svg>
      <span>${target.toUpperCase()}</span>
    </a>`,
      )
      .join("\n")}
  </div>`;
}

export function renderHtml(
  source,
  language,
  page,
  dictionaries = readDictionaries(),
) {
  const dictionary = dictionaries[language];
  if (!dictionary || !pages.includes(page))
    throw new Error(`Unknown page: ${language}/${page}`);
  const translate = (key) => {
    if (!Object.hasOwn(dictionary, key))
      throw new Error(`Missing translation: ${language}/${key}`);
    return dictionary[key];
  };
  const url = siteUrl + pagePath(language, page);
  let html = expandPartials(source);
  html = html.replace(
    /(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,
    (_match, open, content, close) => {
      const translated = content.replace(tokenPattern, (_token, key) =>
        JSON.stringify(translate(key)).slice(1, -1),
      );
      const data = JSON.parse(translated);
      data.url = url;
      return open + safeJson(data) + close;
    },
  );
  html = html.replace(tokenPattern, (_token, key) =>
    escapeHtml(translate(key)),
  );
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${language}"`);
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = html.replace(
    /(<a\b[^>]*\bhref=")([^"?#]*)([?#][^"]*)?("[^>]*>)/g,
    (match, open, path, suffix = "", close) => {
      if (path === "/" || path === "/index.html")
        return open + pagePath(language, "index.html") + suffix + close;
      if (path === "/projects.html")
        return open + pagePath(language, "projects.html") + suffix + close;
      return match;
    },
  );
  if (html.includes("{{languageSwitcher}}")) {
    html = html.replaceAll(
      "{{languageSwitcher}}",
      languageSwitcher(language, page, translate("partial.language.choose")),
    );
  }
  const alternates = [...languages, "x-default"]
    .map(
      (target) =>
        `<link rel="alternate" hreflang="${target}" href="${siteUrl}${pagePath(target === "x-default" ? "pl" : target, page)}" />`,
    )
    .join("\n    ");
  const ogLocales = { pl: "pl_PL", de: "de_DE", en: "en_GB" };
  const runtimeMessages = Object.fromEntries(
    Object.entries(dictionary).filter(([key]) => key.startsWith("runtime.")),
  );
  html = html.replace(
    "</head>",
    `    ${alternates}
    <meta property="og:locale" content="${ogLocales[language]}" />
    ${languages
      .filter((target) => target !== language)
      .map(
        (target) =>
          `<meta property="og:locale:alternate" content="${ogLocales[target]}" />`,
      )
      .join("\n    ")}
    <script id="i18n-messages" type="application/json">${safeJson(runtimeMessages)}</script>
  </head>`,
  );
  if (/\{\{(?:t:|languageSwitcher)/.test(html))
    throw new Error(`Unresolved translation in ${language}/${page}`);
  return html;
}
