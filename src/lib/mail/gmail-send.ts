import { getValidAccessToken } from "../tokens";

export async function sendGmail(userId: string, to: string, subject: string, body: string) {
  const t = await getValidAccessToken(userId, "google");
  if (!t) throw new Error("Google account not connected — cannot send via Gmail route");
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!r.ok) throw new Error(`gmail send failed: ${r.status} ${(await r.text()).slice(0, 160)}`);
  return r.json();
}
