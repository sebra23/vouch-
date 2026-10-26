import { prisma } from "./db";

export async function log(userId: string, source: string, message: string) {
  try { await prisma.appLog.create({ data: { userId, source, message: message.slice(0, 500) } }); }
  catch { /* logging must never break the product */ }
}
