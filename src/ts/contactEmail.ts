const sendButton = document.querySelector<HTMLButtonElement>("#contactButton");
// const name = document.querySelector<HTMLInputElement>("#contactName");
const contact = document.querySelector<HTMLInputElement>("#contactContact");
const message = document.querySelector<HTMLTextAreaElement>("#contactMessage");
const preferable =
  document.querySelector<HTMLTextAreaElement>("#contactPreferable");

sendButton?.addEventListener("click", async (event) => {
  event.preventDefault();
  await sendEmail();
});

async function sendEmail() {
  const response = await fetch("http://localhost:3000/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contact: contact?.value,
      message: message?.value,
      preferable: preferable?.value,
    }),
  });

  if (!response.ok) {
    console.log("SEND EMAIL ERROR:", await response.text());
    throw new Error("Sending failed");
  }
}
