import { t } from "./i18n";

const form = document.querySelector<HTMLFormElement>("#contactForm");
const sendButton = document.querySelector<HTMLButtonElement>("#contactButton");
const status = document.querySelector<HTMLElement>("#contactStatus");
const fieldRules = [
  ["Name", "name", 100, "nameTooLong", true],
  ["Localization", "localization", 100, "locationTooLong", true],
  ["Contact", "contact", 100, "detailsTooLong", true],
  ["Message", "message", 2500, "messageTooLong", true],
  ["Preferable", "preferable", 250, "preferenceTooLong", false],
] as const;

if (form && sendButton && status) {
  // Use translated, accessible inline validation after JavaScript initializes.
  form.noValidate = true;
  const fields = fieldRules.map(([suffix, key, limit, errorKey, required]) => {
    const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#contact${suffix}`)!;
    const error = document.createElement("span");
    error.id = `${input.id}Error`;
    error.className = "modal__field-error";
    input.setAttribute("aria-describedby", error.id);
    input.after(error);
    input.addEventListener("input", () => {
      error.textContent = "";
      input.removeAttribute("aria-invalid");
      if (!pending) status.textContent = "";
    });
    return { input, error, key, limit, errorKey, required };
  });
  const buttonLabel = sendButton.textContent;
  let pending = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;

    status.textContent = "";
    const payload: Record<string, string> = {};
    let firstInvalid: HTMLInputElement | HTMLTextAreaElement | undefined;
    for (const field of fields) {
      const value = field.input.value.trim();
      const error = field.required && !value
        ? t("runtime.contact.required")
        : value.length > field.limit ? t(`runtime.contact.${field.errorKey}`) : "";
      field.error.textContent = error;
      field.input.setAttribute("aria-invalid", error ? "true" : "false");
      if (error) firstInvalid ??= field.input;
      payload[field.key] = value;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    pending = true;
    sendButton.disabled = true;
    sendButton.textContent = t("runtime.contact.sending");
    form.setAttribute("aria-busy", "true");
    fields.forEach(({ input }) => { input.readOnly = true; });
    status.textContent = t("runtime.contact.sending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("https://server.wioryleca-meblenawymiar.pl/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Contact request failed");
      form.reset();
      status.textContent = t("runtime.contact.sent");
    } catch {
      // A timeout does not prove the server failed to deliver the message.
      status.textContent = t(controller.signal.aborted
        ? "runtime.contact.timeout" : "runtime.contact.sendFailed");
    } finally {
      window.clearTimeout(timeout);
      pending = false;
      sendButton.disabled = false;
      sendButton.textContent = buttonLabel;
      form.removeAttribute("aria-busy");
      fields.forEach(({ input }) => { input.readOnly = false; });
      if (form.closest(".modal__backdrop")?.classList.contains("is-open")) {
        status.scrollIntoView({ block: "nearest" });
      }
    }
  });
}
