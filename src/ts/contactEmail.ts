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
    alert("Wiadomość została wysłana.");
  } catch (error) {
    console.error("Błąd wysyłania wiadomości:", error);
    alert(error instanceof Error ? error.message : "Wystąpił nieznany błąd.");
  }
});

async function sendEmail() {
  const trimmedName = name?.value.trim();
  const trimmedLocalization = localization?.value.trim();
  const trimmedContact = contact?.value.trim();
  const trimmedMessage = message?.value.trim();
  const trimmedPreferable = preferable?.value.trim();

  if (
    trimmedName?.length === 0 ||
    trimmedLocalization?.length === 0 ||
    trimmedContact?.length === 0 ||
    trimmedMessage?.length === 0
  ) {
    console.log("Uzupełnij wszystkie wymagane pola.");

    throw new Error("Uzupełnij wszystkie wymagane pola.");
  }

  if (trimmedName && trimmedName.length > 100) {
    console.log("Imię i nazwisko jest za długie.");

    throw new Error("Imię i nazwisko jest za długie.");
  }

  if (trimmedLocalization && trimmedLocalization.length > 100) {
    console.log("Lokalizacja jest za długa.");

    throw new Error("Lokalizacja jest za długa.");
  }

  if (trimmedContact && trimmedContact.length > 100) {
    console.log("Dane kontaktowe są za długie.");

    throw new Error("Dane kontaktowe są za długie.");
  }

  if (trimmedMessage && trimmedMessage.length > 2500) {
    console.log("Wiadomość jest za długa.");

    throw new Error("Wiadomość jest za długa.");
  }

  if (trimmedPreferable && trimmedPreferable.length > 250) {
    console.log("Preferowany sposób kontaktu jest za długi.");

    throw new Error("Preferowany sposób kontaktu jest za długi.");
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
    console.log("BŁĄD WYSYŁANIA WIADOMOŚCI:", await response.text());
    throw new Error(
      "Nie udało się wysłać wiadomości. Spróbuj ponownie później.",
    );
  }
}
