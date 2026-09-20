const locale = document.documentElement.lang;
const messageElement = document.querySelector<HTMLScriptElement>(
  '#i18n-messages[type="application/json"]',
);

if (!["pl", "de", "en"].includes(locale) || !messageElement?.textContent) {
  throw new Error(`Missing translation dictionary for locale "${locale}".`);
}

const parsedMessages: unknown = JSON.parse(messageElement.textContent);

if (
  !parsedMessages ||
  typeof parsedMessages !== "object" ||
  Array.isArray(parsedMessages) ||
  Object.values(parsedMessages).some((value) => typeof value !== "string")
) {
  throw new Error(`Invalid translation dictionary for locale "${locale}".`);
}

const messages = parsedMessages as Record<string, string>;

export function t(
  key: string,
  params: Record<string, string | number> = {},
): string {
  if (!Object.hasOwn(messages, key)) {
    throw new Error(`Missing translation "${key}" for locale "${locale}".`);
  }

  return messages[key].replace(/\{(\w+)\}/g, (_, parameter: string) => {
    if (!Object.hasOwn(params, parameter)) {
      throw new Error(`Missing parameter "${parameter}" for translation "${key}".`);
    }

    return String(params[parameter]);
  });
}

export function refreshLanguageLinks() {
  document.querySelectorAll<HTMLAnchorElement>("a[data-language-link]").forEach(
    (link) => {
      const url = new URL(link.href);
      url.search = window.location.search;
      url.hash = window.location.hash;
      link.href = `${url.pathname}${url.search}${url.hash}`;
    },
  );
}
