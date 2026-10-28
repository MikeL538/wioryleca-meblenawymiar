import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { languages, pages, pagePath, siteUrl, business, imageDimensions } from "../build/seo.mjs";
import { catalog, categories, categoryPage, galleryRoutes, imagesForPage } from "../build/catalog.mjs";

const read = (path) => readFileSync(resolve("dist", path), "utf8");
const htmlFor = (language, page) => read(`${language === "pl" ? "" : `${language}/`}${page}`);
const unescape = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

for (const language of languages) {
  test(`${language}: SEO metadata, structured data and crawlable links on every page`, () => {
    const titles = new Set();
    const descriptions = new Set();
    for (const page of pages) {
      const html = htmlFor(language, page);
      assert.doesNotMatch(html, /\{\{|<include\b/, `unresolved template: ${page}`);
      assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `one H1: ${page}`);
      assert.equal([...html.matchAll(/<title>/g)].length, 1);
      const title = html.match(/<title>(.*?)<\/title>/)[1];
      const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
      assert.ok(!titles.has(title), `unique title: ${page}`);
      assert.ok(!descriptions.has(description), `unique description: ${page}`);
      titles.add(title);
      descriptions.add(description);
      assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
      assert.ok(html.includes(`rel="canonical" href="${siteUrl}${pagePath(language, page)}"`));
      assert.ok(html.includes('content="index, follow, max-image-preview:large"'));
      assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
      assert.ok(html.includes('type="image/png" href="/logos.png"'));
      for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
        if (!href.startsWith("/")) continue;
        const path = new URL(unescape(href), siteUrl).pathname;
        assert.ok(existsSync(resolve("dist", `.${path}${path.endsWith("/") ? "index.html" : ""}`)), `broken link: ${page} -> ${path}`);
      }
      for (const [tag, src] of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
        assert.match(tag, /\balt="[^"]*"/);
        const size = imageDimensions(src);
        assert.ok(tag.includes(`width="${size.width}"`) && tag.includes(`height="${size.height}"`));
      }
      const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      assert.equal(graphs.length, 1);
      const data = JSON.parse(graphs[0][1]);
      assert.equal(data["@context"], "https://schema.org");
      const organization = data["@graph"].find((entity) => entity["@type"] === "Organization");
      assert.equal(organization["@id"], `${siteUrl}/#organization`);
      assert.equal(organization.telephone, business.telephone);
      assert.equal(organization.email, business.email);
      assert.deepEqual(organization.sameAs, business.sameAs);
      assert.deepEqual(organization.areaServed.map(({ name }) => name), business.cities);
      assert.doesNotMatch(JSON.stringify(data), /PostalAddress|streetAddress|postalCode|geo|aggregateRating|LocalBusiness/);
      const webpage = data["@graph"].find((entity) => ["WebPage", "CollectionPage"].includes(entity["@type"]));
      assert.equal(webpage.url, siteUrl + pagePath(language, page));
      assert.equal(webpage.inLanguage, language);
      assert.equal(webpage.name, unescape(title));
      assert.equal(webpage.description, unescape(description));
      if (page !== "index.html") {
        const breadcrumbs = data["@graph"].find((entity) => entity["@type"] === "BreadcrumbList").itemListElement;
        assert.equal(breadcrumbs.at(-1).item, webpage.url);
        assert.deepEqual(breadcrumbs.map(({ position }) => position), breadcrumbs.map((_, i) => i + 1));
      }
    }
  });

  test(`${language}: all gallery photos are in static HTML and reachable through pagination`, () => {
    for (const category of categories) {
      const actual = [];
      const routes = Object.entries(galleryRoutes).filter(([, route]) => route.category === category);
      for (const [page, route] of routes) {
        const html = htmlFor(language, page);
        const gallery = html.match(/<ul id="projectList"[^>]*>([\s\S]*?)<\/ul>/)[1];
        const sources = [...gallery.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(([, src]) => src);
        assert.deepEqual(sources, imagesForPage(page));
        actual.push(...sources);
        if (routes.length > 1) for (let number = 1; number <= routes.length; number++) {
          assert.ok(html.includes(`href="${pagePath(language, categoryPage(category, number))}"`));
        }
        if (route.number > 1) assert.ok(html.includes(`rel="canonical" href="${siteUrl}${pagePath(language, page)}"`));
      }
      assert.deepEqual(actual, catalog[category]);
      assert.equal(new Set(actual).size, actual.length);
    }
  });
}

test("sitemap contains exactly canonical pages and the complete photo catalogue", () => {
  const sitemap = read("sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
  assert.deepEqual(locations, languages.flatMap((language) => pages.map((page) => siteUrl + pagePath(language, page))));
  assert.equal(new Set(locations).size, locations.length);
  assert.doesNotMatch(sitemap, /404|<priority>|<changefreq>|<lastmod>/);
  assert.ok(locations.every((url) => !url.includes("?")));
  const images = new Set([...sitemap.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(([, src]) => src));
  assert.deepEqual(images, new Set(Object.values(catalog).flat().map((src) => siteUrl + src)));
  assert.ok(read("robots.txt").includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  assert.doesNotMatch(read("robots.txt"), /Disallow:\s*\/\s*$|Host:/m);
  assert.ok(read("404.html").includes('name="robots" content="noindex, follow"'));
});
