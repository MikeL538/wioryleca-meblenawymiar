import { readFileSync } from "node:fs";
import { imageSize } from "image-size";
import { catalog, categories, categoryConfig, categoryPage, galleryRoutes, imagesForPage, pageSize } from "./catalog.mjs";

export const siteUrl = "https://www.wioryleca-meblenawymiar.pl";
export const languages = ["pl", "de", "en"];
export const pages = ["index.html", "projects.html", ...Object.keys(galleryRoutes)];
export const business = {
  name: "Wióry Lecą", email: "wiory_leca@wp.pl", telephone: "+48727198709",
  sameAs: ["https://www.facebook.com/profile.php?id=100057508506559", "https://www.instagram.com/wiory_leca_meble_na_wymiar/"],
  cities: ["Żagań", "Bolesławiec", "Wrocław"],
};
export const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#39;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export const safeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
export function pagePath(language, page) {
  return (language === "pl" ? "/" : `/${language}/`) + (page === "index.html" ? "" : page);
}
const dimensions = new Map();
export function imageDimensions(src) {
  if (!dimensions.has(src)) dimensions.set(src, imageSize(readFileSync(new URL(`../public${src}`, import.meta.url))));
  return dimensions.get(src);
}

export function pageMetadata(page, t) {
  const route = galleryRoutes[page];
  const scope = page === "index.html" ? "home" : "projects";
  const suffix = route?.number > 1 ? ` — ${t("page.seo.page").replace("{page}", String(route.number))}` : "";
  return {
    title: route ? `${t(`page.category.${route.category}.heading`)}${suffix} | Wióry Lecą` : t(`page.${scope}.title`),
    description: route ? t(`page.category.${route.category}.description`) + (suffix ? `${suffix}.` : "") : t(`page.${scope}.description`),
    heading: route ? t(`page.category.${route.category}.heading`) + suffix : t("page.projects.heading"),
    intro: route ? t(`page.category.${route.category}.intro`) : t("page.projects.intro"),
  };
}

export function breadcrumbs(language, page, t) {
  const crumbs = [{ name: t("partial.footer.home"), item: siteUrl + pagePath(language, "index.html") }];
  if (page !== "index.html") crumbs.push({ name: t("partial.nav.projects"), item: siteUrl + pagePath(language, "projects.html") });
  const route = galleryRoutes[page];
  if (route) crumbs.push({ name: t(`page.category.${route.category}.heading`), item: siteUrl + pagePath(language, categoryPage(route.category)) });
  if (route?.number > 1) crumbs.push({ name: t("page.seo.page").replace("{page}", String(route.number)), item: siteUrl + pagePath(language, page) });
  return crumbs;
}

export function seoHead(language, page, t) {
  const { title, description } = pageMetadata(page, t);
  const url = siteUrl + pagePath(language, page);
  const image = imagesForPage(page)[0] ?? "/images/kitchen/kuchnia20.webp";
  const size = imageDimensions(image);
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const pageId = `${url}#webpage`;
  // The workshop address is private. Do not invent a PostalAddress or LocalBusiness eligibility.
  const organization = {
    "@type": "Organization", "@id": organizationId, name: business.name, url: `${siteUrl}/`,
    logo: { "@type": "ImageObject", url: `${siteUrl}/logos.png`, width: imageDimensions("/logos.png").width, height: imageDimensions("/logos.png").height },
    image: siteUrl + image, telephone: business.telephone, email: business.email,
    description: t("page.home.businessDescription"), sameAs: business.sameAs,
    areaServed: business.cities.map((name) => ({ "@type": "City", name })),
  };
  const graph = [organization, {
    "@type": "WebSite", "@id": websiteId, url: `${siteUrl}/`, name: business.name,
    publisher: { "@id": organizationId }, inLanguage: languages,
  }, {
    "@type": page === "index.html" ? "WebPage" : "CollectionPage", "@id": pageId,
    url, name: title, description, inLanguage: language,
    isPartOf: { "@id": websiteId }, about: { "@id": organizationId },
    primaryImageOfPage: { "@type": "ImageObject", contentUrl: siteUrl + image, width: size.width, height: size.height },
    ...(page !== "index.html" ? { breadcrumb: { "@id": `${url}#breadcrumbs` } } : {}),
  }];
  if (page !== "index.html") graph.push({
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`,
    itemListElement: breadcrumbs(language, page, t).map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
  });
  return `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Wióry Lecą" />
    <meta property="og:image" content="${siteUrl}${image}" />
    <meta property="og:image:width" content="${size.width}" />
    <meta property="og:image:height" content="${size.height}" />
    <meta property="og:image:alt" content="${escapeHtml(t("page.seo.imageAlt"))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${siteUrl}${image}" />
    <meta name="twitter:image:alt" content="${escapeHtml(t("page.seo.imageAlt"))}" />
    ${page === "index.html" ? '<link rel="preload" as="image" href="/images/hero.jpg" fetchpriority="high" />' : ""}
    <script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

export function renderGallery(language, page, t) {
  const route = galleryRoutes[page];
  const metadata = pageMetadata(page, t);
  const crumbHtml = breadcrumbs(language, page, t).map((crumb, i, all) =>
    `<li>${i === all.length - 1 ? `<span aria-current="page">${escapeHtml(crumb.name)}</span>` : `<a href="${new URL(crumb.item).pathname}">${escapeHtml(crumb.name)}</a>`}</li>`).join("");
  const navigation = categories.map((category) => `<li class="categories__item"><a class="categories__button${route?.category === category ? " categories__button--active" : ""}" href="${pagePath(language, categoryPage(category))}"${route?.category === category ? ' aria-current="page"' : ""}>
    <svg class="categories__icon" aria-hidden="true"><use href="/icons.svg#${categoryConfig[category].icon}"></use></svg>${escapeHtml(t(`page.category.${category}.heading`))}</a></li>`).join("");
  const images = imagesForPage(page).map((src, i) => {
    const category = route?.category ?? categories.find((key) => catalog[key].includes(src));
    const number = catalog[category].indexOf(src) + 1;
    const alt = t("page.seo.photoAlt").replace("{category}", t(`page.category.${category}.heading`)).replace("{number}", String(number));
    return `<li class="projects__list-item"><a href="${src}" data-modal-open="image" class="projects__list-button"><img class="projects__list-img" src="${src}" alt="${escapeHtml(alt)}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" /></a></li>`;
  }).join("\n");
  const total = route ? Math.ceil(catalog[route.category].length / pageSize) : 0;
  const pagination = total > 1 ? `<nav id="projectPagination" class="projects__pagination" aria-label="${escapeHtml(t("page.projects.pagination"))}">${Array.from({ length: total }, (_, i) => {
    const number = i + 1;
    return `<a class="projects__pagination-button${number === route.number ? " projects__pagination-button--active" : ""}" href="${pagePath(language, categoryPage(route.category, number))}" aria-label="${escapeHtml(t("page.seo.page").replace("{page}", String(number)))}"${number === route.number ? ' aria-current="page"' : ""}>${number}</a>`;
  }).join("")}</nav>` : "";
  return `<div class="gallery-heading">
    <nav aria-label="${escapeHtml(t("page.seo.breadcrumbs"))}"><ol class="breadcrumbs">${crumbHtml}</ol></nav>
    <h1>${escapeHtml(metadata.heading)}</h1>
  </div>
  <nav class="categories" aria-label="${escapeHtml(t("page.offer.title"))}"><div class="categories__container"><ul class="categories__list">${navigation}</ul></div></nav>
  <section class="projects" aria-label="${escapeHtml(metadata.heading)}"><div class="projects__container">
    <ul id="projectList" class="projects__list">${images}</ul>${pagination}
  </div></section>
  <section class="gallery-details" aria-labelledby="galleryDetailsTitle">
    <div class="gallery-details__layout">
      <div class="gallery-details__description">
        <h2 id="galleryDetailsTitle">${escapeHtml(t("page.seo.aboutHeading"))}</h2>
        <p>${escapeHtml(metadata.intro)}</p>
      </div>
      <div class="gallery-details__contact">
        <h3>${escapeHtml(t("partial.nav.contact"))}</h3>
        <p>${escapeHtml(t("page.seo.contact"))}</p>
        <a href="tel:${business.telephone}">${escapeHtml(t("partial.contact.phoneValue"))}</a>
        <a href="mailto:${business.email}">${business.email}</a>
      </div>
    </div>
  </section>`;
}

export function addImageDimensions(html) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\bsrc="(\/(?:images\/[^"?#]+|logo(?:s)?\.png))"/)?.[1];
    if (!src) return tag;
    const { width, height } = imageDimensions(src);
    let attributes = "";
    if (!/\bwidth=/.test(tag)) attributes += ` width="${width}"`;
    if (!/\bheight=/.test(tag)) attributes += ` height="${height}"`;
    return tag.replace(/\s*\/?>(?=$)/, `${attributes} />`);
  });
}

export function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${languages.flatMap((language) => pages.map((page) => `  <url><loc>${siteUrl}${pagePath(language, page)}</loc>${imagesForPage(page).map((src) => `<image:image><image:loc>${siteUrl}${src}</image:loc></image:image>`).join("")}</url>`)).join("\n")}
</urlset>\n`;
}
