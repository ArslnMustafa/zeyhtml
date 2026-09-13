const resendApiBaseUrl = "https://api.resend.com";

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.DATE_NOTIFY_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL;

  return { apiKey, recipient, sender };
}

export async function verifyResendCredentials() {
  const { apiKey } = getEmailConfig();
  if (!apiKey) return false;

  const response = await fetch(`${resendApiBaseUrl}/domains`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return response.ok;
}

export async function sendOwnerEmail(input: { subject: string; text: string }) {
  const { apiKey, recipient, sender } = getEmailConfig();
  if (!apiKey || !recipient || !sender) {
    console.warn("[Email] Resend email configuration is incomplete.");
    return false;
  }

  const response = await fetch(`${resendApiBaseUrl}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.warn(`[Email] Resend rejected the email request: ${response.status} ${responseText}`);
    return false;
  }

  return true;
}
