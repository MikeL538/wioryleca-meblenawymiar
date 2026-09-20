import { t } from "./i18n";

class ContactError extends Error {}

const sendButton = document.querySelector<HTMLButtonElement>("#contactButton");
const name = document.querySelector<HTMLInputElement>("#contactName");
const localization = document.querySelector<HTMLInputElement>(
  "#contactLocalization",
);
const contact = document.querySelector<HTMLInputElement>("#contactContact");
const message = document.querySelector<HTMLTextAreaElement>("#contactMessage");
const preferable =
  document.querySelector<HTMLTextAreaElement>("#contactPreferable");

sendButton?.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    await sendEmail();
    alert(t("runtime.contact.sent"));
  } catch (error) {
    console.error(t("runtime.contact.error"), error);
    alert(
      error instanceof ContactError
        ? error.message
        : t("runtime.contact.sendFailed"),
    );
  }
});

async function sendEmail() {
  const trimmedName = name?.value.trim();
  const trimmedLocalization = localization?.value.trim();
  const trimmedContact = contact?.value.trim();
  const trimmedMessage = message?.value.trim();
  const trimmedPreferable = preferable?.value.trim();

  if (
    !trimmedName ||
    !trimmedLocalization ||
    !trimmedContact ||
    !trimmedMessage
  ) {
    throw new ContactError(t("runtime.contact.required"));
  }

  if (trimmedName && trimmedName.length > 100) {
    throw new ContactError(t("runtime.contact.nameTooLong"));
  }

  if (trimmedLocalization && trimmedLocalization.length > 100) {
    throw new ContactError(t("runtime.contact.locationTooLong"));
  }

  if (trimmedContact && trimmedContact.length > 100) {
    throw new ContactError(t("runtime.contact.detailsTooLong"));
  }

  if (trimmedMessage && trimmedMessage.length > 2500) {
    throw new ContactError(t("runtime.contact.messageTooLong"));
  }

  if (trimmedPreferable && trimmedPreferable.length > 250) {
    throw new ContactError(t("runtime.contact.preferenceTooLong"));
  }

  const response = await fetch(
    "https://server.wioryleca-meblenawymiar.pl/send-email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
        localization: trimmedLocalization,
        contact: trimmedContact,
        message: trimmedMessage,
        preferable: trimmedPreferable,
      }),
    },
  );

  if (!response.ok) {
    console.error(t("runtime.contact.error"), await response.text());
    throw new ContactError(t("runtime.contact.sendFailed"));
  }
}
