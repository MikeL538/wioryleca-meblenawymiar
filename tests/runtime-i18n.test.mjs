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
  const fields = Object.fromEntries(["Name", "Localization", "Contact", "Message", "Preferable"].map(
    (name) => [name, { value: "" }],
  ));
  const buttonEvents = {};
  const windowEvents = {};
  const state = { alerts: [], requests: [], response: "success" };
  const projectList = {
    innerHTML: "",
    insertAdjacentHTML(_position, html) { this.innerHTML += html; },
    scrollIntoView() {},
  };
  const pagination = { innerHTML: "", querySelectorAll() { return []; } };
  const categories = ["wardrobe", "kitchen", "bathroom", "built-in"].map((category) => ({
    dataset: { category },
    classList: { toggle() {} },
    setAttribute() {},
    addEventListener(_event, listener) { this.click = listener; },
  }));
  const document = {
    documentElement: { lang: locale },
    readyState: "complete",
    body: { clientWidth: 1080 },
    querySelector(selector) {
      if (selector.startsWith("#i18n-messages")) return { textContent: JSON.stringify(messages) };
      if (selector === "#contactButton") return {
        addEventListener(event, listener) { buttonEvents[event] = listener; },
      };
      if (selector === "#projectList") return projectList;
      if (selector === "#projectPagination") return pagination;
      return fields[selector.replace("#contact", "")] ?? null;
    },
    querySelectorAll(selector) {
      if (selector === "a[data-language-link]") return links;
      if (selector === ".categories__button[data-category]") return categories;
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
    console: { error() {} },
    alert(message) { state.alerts.push(message); },
    // The VM has no native fetch; every request stays inside this mock.
    async fetch(url, options) {
      state.requests.push({ url, options });
      if (state.response === "network") throw new TypeError("Failed to fetch");
      return { ok: state.response === "success", text: async () => "Mock API error" };
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
    state, messages, fields, location, links, windowEvents,
    projectList, pagination, categories, i18n, load,
    submit: () => buttonEvents.click({ preventDefault() {} }),
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

  test(`${locale}: form validation and mocked submission use localized messages`, async () => {
    const { fields, load, submit, state, messages } = createRuntime(locale);
    load("contactEmail");
    const valid = { Name: "Test", Localization: "City", Contact: "test@example.test", Message: "Test message", Preferable: "" };
    const fill = () => Object.entries(valid).forEach(([name, value]) => { fields[name].value = ` ${value} `; });
    fill();
    for (const field of ["Name", "Localization", "Contact", "Message"]) {
      fields[field].value = "   ";
      await submit();
      assert.equal(state.alerts.pop(), messages["runtime.contact.required"]);
      assert.equal(state.requests.length, 0);
      fill();
    }
    const limits = [
      ["Name", 100, "nameTooLong"], ["Localization", 100, "locationTooLong"],
      ["Contact", 100, "detailsTooLong"], ["Message", 2500, "messageTooLong"],
      ["Preferable", 250, "preferenceTooLong"],
    ];
    for (const [field, limit, key] of limits) {
      fields[field].value = "x".repeat(limit + 1);
      await submit();
      assert.equal(state.alerts.pop(), messages[`runtime.contact.${key}`]);
      assert.equal(state.requests.length, 0);
      fill();
    }
    await submit();
    assert.equal(state.alerts.pop(), messages["runtime.contact.sent"]);
    assert.equal(state.requests.length, 1);
    const { url, options } = state.requests[0];
    assert.equal(url, "https://server.wioryleca-meblenawymiar.pl/send-email");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), {
      name: valid.Name, localization: valid.Localization, contact: valid.Contact,
      message: valid.Message, preferable: valid.Preferable,
    });
    for (const response of ["api", "network"]) {
      state.response = response;
      await submit();
      assert.equal(state.alerts.pop(), messages["runtime.contact.sendFailed"]);
    }
  });

  test(`${locale}: inherited categories fall back safely; category changes update language links`, () => {
    for (const invalidCategory of ["constructor", "__proto__", "toString"]) {
      const runtime = createRuntime(locale);
      runtime.location.searchParams.set("category", invalidCategory);
      runtime.load("imagesGenerator");
      assert.ok(runtime.projectList.innerHTML.includes("/images/kitchen/kuchnia1.webp"));
      assert.ok(runtime.projectList.innerHTML.includes(runtime.messages["runtime.projects.imageAlt"]));
      assert.ok(runtime.pagination.innerHTML.includes(runtime.messages["runtime.projects.previousPage"]));
      assert.ok(runtime.pagination.innerHTML.includes(runtime.messages["runtime.projects.nextPage"]));
      runtime.categories[0].click();
      assert.equal(runtime.location.searchParams.get("category"), "wardrobe");
      assert.ok(runtime.projectList.innerHTML.includes("/images/wardrobes/szafa1.webp"));
      for (const link of runtime.links) {
        assert.equal(new URL(link.href).search, "?category=wardrobe&source=test");
        assert.equal(new URL(link.href).hash, "#projects");
      }
    }
  });
}
