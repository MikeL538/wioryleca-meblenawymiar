import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const locales = ["pl", "de", "en"];
const dictionaries = Object.fromEntries(locales.map((locale) => [
  locale,
  JSON.parse(readFileSync(new URL(`../src/locales/runtime/${locale}.json`, import.meta.url), "utf8")),
]));
const compiledModules = new Map();

function moduleSource(name) {
  if (!compiledModules.has(name)) {
    const source = readFileSync(new URL(`../src/ts/${name}.ts`, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
    });
    compiledModules.set(name, `(function(exports, require) { ${outputText}\n})`);
  }
  return compiledModules.get(name);
}

function createRuntime(locale, route = "projects.html") {
  const messages = dictionaries[locale];
  const prefixes = ["/", "/de/", "/en/"];
  const location = new URL(`https://example.test${prefixes[locales.indexOf(locale)]}${route}?category=wardrobe&source=test#projects`);
  const links = prefixes.map((prefix) => {
    let url = new URL(prefix + route, location);
    return {
      get href() { return url.href; },
      set href(value) { url = new URL(value, location); },
    };
  });
  const windowEvents = {};
  const document = {
    documentElement: { lang: locale },
    readyState: "complete",
    body: { clientWidth: 1080 },
    querySelector(selector) {
      if (selector.startsWith("#i18n-messages")) return { textContent: JSON.stringify(messages) };
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "a[data-language-link]") return links;
      return [];
    },
  };
  const context = vm.createContext({
    document,
    URL,
    URLSearchParams,
    window: {
      location,
      history: { replaceState(_state, _title, url) { location.href = url.href; } },
      addEventListener(event, listener) { windowEvents[event] = listener; },
    },
  });
  let i18n;
  function load(name) {
    const exports = {};
    vm.runInContext(moduleSource(name), context, { filename: `${name}.ts` })(exports, (specifier) => {
      assert.equal(specifier, "./i18n");
      return i18n;
    });
    return exports;
  }
  i18n = load("i18n");
  return {
    messages, location, links, windowEvents,
    i18n, load,
  };
}

test("runtime dictionaries have matching keys and placeholders", () => {
  const keys = Object.keys(dictionaries.pl).sort();
  for (const locale of locales) {
    assert.deepEqual(Object.keys(dictionaries[locale]).sort(), keys);
    for (const key of keys) {
      assert.equal(typeof dictionaries[locale][key], "string");
      assert.ok(dictionaries[locale][key].trim());
      assert.deepEqual(
        dictionaries[locale][key].match(/\{\w+\}/g),
        dictionaries.pl[key].match(/\{\w+\}/g),
      );
    }
  }
});

for (const locale of locales) {
  test(`${locale}: interpolation rejects missing translations and parameters`, () => {
    const { i18n, messages } = createRuntime(locale);
    assert.equal(i18n.t("runtime.projects.page", { page: 2 }), messages["runtime.projects.page"].replace("{page}", "2"));
    assert.throws(() => i18n.t("missing"), /Missing translation/);
    assert.throws(() => i18n.t("constructor"), /Missing translation/);
    assert.throws(() => i18n.t("runtime.projects.page"), /Missing parameter/);
  });

  test(`${locale}: language links retain the page, query and hash`, () => {
    for (const route of ["", "projects.html"]) {
      const runtime = createRuntime(locale, route);
      runtime.load("small");
      const checkLinks = () => runtime.links.forEach((link, index) => {
        const url = new URL(link.href);
        assert.equal(url.pathname, ["/", "/de/", "/en/"][index] + route);
        assert.equal(url.search, runtime.location.search);
        assert.equal(url.hash, runtime.location.hash);
      });
      checkLinks();
      runtime.location.hash = "#contact";
      runtime.windowEvents.hashchange();
      checkLinks();
      runtime.location.search = "?category=bathroom";
      runtime.windowEvents.popstate();
      checkLinks();
    }
  });

}
