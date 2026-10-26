import { prisma } from "./db";

export async function spendCredits(userId: string, amount: number): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { creditsBalance: true, trialEndsAt: true } });
  if (!u) return false;
  if (u.trialEndsAt && u.trialEndsAt < new Date() && u.creditsBalance <= 0) return false;
  if (u.creditsBalance < amount) return false;
  await prisma.user.update({ where: { id: userId }, data: { creditsBalance: { decrement: amount } } });
  return true;
}
