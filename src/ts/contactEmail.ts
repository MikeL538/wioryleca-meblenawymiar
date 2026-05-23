import { Resend } from "resend";

const sendButton = document.querySelector<HTMLButtonElement>("#contactButton");
// const name = document.querySelector<HTMLInputElement>("#contactName");
const contact = document.querySelector<HTMLInputElement>("#contactContact");
const message = document.querySelector<HTMLTextAreaElement>("#contactMessage");
const preferable =
  document.querySelector<HTMLTextAreaElement>("#contactPreferable");

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

sendButton?.addEventListener("click", async (event) => {
  event.preventDefault();
  await sendEmail();
});

async function sendEmail() {
  if (!resend) {
    console.error("RESEND_API_KEY is missing.");
    throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  }

  const { error } = await resend.emails.send({
    from: `Wiory Lecą <@mail.wioryleca-meblenawymiar.pl>`,
    to: "mikel538.work@gmail.com",
    subject: "Wiadomość Kontaktowa",
    html: `Kontakt: ${contact?.value}

Wiadomość: ${message?.value}

Preferencje: ${preferable?.value}`,
  });

  if (error) {
    console.log("RESEND ERROR:", error);
    throw new Error("Sending failed");
  }
}
