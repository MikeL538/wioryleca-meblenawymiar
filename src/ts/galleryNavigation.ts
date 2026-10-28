// Old shared links keep working after categories move to static HTML pages.
if (window.location.pathname.endsWith("/projects.html")) {
  const current = new URL(window.location.href);
  const category = current.searchParams.get("category");
  const target = Array.from(document.querySelectorAll<HTMLAnchorElement>(".categories__button[href]"))
    .find((link) => new URL(link.href).pathname.endsWith(`/projects/${category}.html`));
  if (category && target) {
    const destination = new URL(target.href);
    current.searchParams.delete("category");
    destination.search = current.searchParams.toString();
    destination.hash = current.hash;
    window.location.replace(destination.href);
  }
}
