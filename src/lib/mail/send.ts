import { Resend } from "resend";
import { sendGmail } from "./gmail-send";

export const MAIL_DOMAIN = process.env.MAIL_DOMAIN || "ari.app";

// Sends FROM the assistant's own address (agent identity).
// Primary: Resend (needs RESEND_API_KEY + DNS on MAIL_DOMAIN).
// Interim fallback: sends through the user's Gmail (identity = user) — notifications only.
export async function sendAsAssistant(assistantSlug: string, assistantName: string,
                                      userId: string, to: string, subject: string, body: string) {
  const from = `${assistantName} <${assistantSlug}@${MAIL_DOMAIN}>`;
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from, to, subject, text: body });
    return { via: "resend", from };
  }
  await sendGmail(userId, to, subject, body);
  return { via: "gmail-fallback", from: `${assistantName} (via your Gmail) <you>` };
}
