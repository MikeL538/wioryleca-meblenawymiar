import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { languages, pages, pagePath, readDictionaries, renderHtml, rootPath, siteUrl } from "../build/i18n.mjs";

const dictionaries = readDictionaries();
const read = (path) => readFileSync(resolve(rootPath, path), "utf8");

for (const language of languages) {
  for (const page of pages) {
    test(`built ${language}/${page}: translated content, metadata, links and assets`, () => {
      const html = read(`dist/${language === "pl" ? "" : `${language}/`}${page}`);
      assert.ok(html.includes(`<html lang="${language}">`));
      assert.doesNotMatch(html, /\{\{(?:t:|languageSwitcher)|<include\b/);
      assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}${pagePath(language, page)}"`));
      assert.ok(html.includes(`<meta property="og:url" content="${siteUrl}${pagePath(language, page)}"`));
      for (const target of [...languages, "x-default"]) {
        assert.ok(html.includes(`hreflang="${target}" href="${siteUrl}${pagePath(target === "x-default" ? "pl" : target, page)}"`));
      }
      const switchers = [...html.matchAll(/<a\b[^>]*data-language-link="(pl|de|en)"[^>]*>/g)];
      assert.equal(switchers.length, 6, "desktop and mobile language links");
      for (const [tag, target] of switchers) {
        assert.ok(tag.includes(`href="${pagePath(target, page)}"`));
        assert.equal(tag.includes('aria-current="page"'), target === language);
      }
      for (const [tag, href] of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)) {
        if (tag.includes("data-language-link") || !href.startsWith("/")) continue;
        assert.ok(href === pagePath(language, "index.html") || href.startsWith(pagePath(language, "projects.html")), `wrong locale link ${href}`);
      }
      assert.ok(html.includes(`href="${pagePath(language, "projects.html")}?category=kitchen"`));
      assert.doesNotMatch(html, /(?:href|src)="\.\/(?:icons|images)/);
      for (const [, asset] of html.matchAll(/(?:src|href)="(\/(?:assets|images)\/[^"#?]+|\/[^"/]+\.(?:png|svg))(?:#[^"]*)?"/g)) {
        assert.ok(existsSync(resolve(rootPath, `dist${asset}`)), `missing asset ${asset}`);
      }
      const messages = JSON.parse(html.match(/<script id="i18n-messages" type="application\/json">([\s\S]*?)<\/script>/)[1]);
      assert.deepEqual(messages, JSON.parse(read(`src/locales/runtime/${language}.json`)));
      if (page === "index.html") {
        const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
        assert.equal(data.url, siteUrl + pagePath(language, page));
        assert.equal(data.description, dictionaries[language]["page.home.businessDescription"]);
      }
    });
  }
}

test("missing translation prevents shipping a partial translation", () => {
  assert.throws(() => renderHtml("{{t:missing}}", "en", "index.html"), /Missing translation/);
});

test("translations safely escape attributes, text, JSON-LD and embedded messages", () => {
  const value = 'A "quote" & <tag> </script>';
  const dictionary = { en: { "page.test": value, "runtime.test": value } };
  const html = renderHtml('<html lang="pl"><head><script type="application/ld+json">{"description":"{{t:page.test}}"}</script></head><body><p title="{{t:page.test}}">{{t:page.test}}</p></body></html>', "en", "index.html", dictionary);
  assert.ok(html.includes('title="A &quot;quote&quot; &amp; &lt;tag&gt; &lt;/script&gt;"'));
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 2);
  assert.equal(JSON.parse(scripts[0][1]).description, value);
  assert.equal(JSON.parse(scripts[1][1])["runtime.test"], value);
});

test("sitemap covers all six localized pages and language flags exist", () => {
  const sitemap = read("dist/sitemap.xml");
  const icons = read("dist/icons.svg");
  for (const language of languages) {
    for (const page of pages) assert.ok(sitemap.includes(`<loc>${siteUrl}${pagePath(language, page)}</loc>`));
  }
  for (const id of ["germany", "poland", "uk"]) assert.ok(icons.includes(`<symbol id="${id}" viewBox=`));
});
