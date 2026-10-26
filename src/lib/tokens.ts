import { prisma } from "./db";

export async function getValidAccessToken(userId: string, provider: "google" | "azure-ad") {
  const acc = await prisma.account.findFirst({ where: { userId, provider } });
  if (!acc?.access_token) return null;
  const exp = acc.expires_at ? acc.expires_at * 1000 : 0;
  if (Date.now() < exp - 60_000) return acc.access_token;
  if (provider === "google" && acc.refresh_token) {
    const body = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: acc.refresh_token, grant_type: "refresh_token" });
    const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
    const j = await r.json();
    if (!j.access_token) return null;
    await prisma.account.update({ where: { id: acc.id },
      data: { access_token: j.access_token, expires_at: Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600) } });
    return j.access_token;
  }
  return null; // Microsoft refresh via provider token rotation in v4 adapter — reconnect flow
}
