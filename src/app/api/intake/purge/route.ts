import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";

// POST /api/intake/purge — hard-deletes ALL intake threads and their messages,
// then clears peer fields everywhere (spec §4 GDPR: owner's "delete all intake data").
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const threads = await prisma.thread.findMany({ where: { userId, source: "intake" }, select: { id: true } });
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { threadId: { in: threads.map(t => t.id) } } }),
    prisma.thread.deleteMany({ where: { userId, source: "intake" } }),
    // defensive: clear any residual peer fields on non-intake threads
    prisma.thread.updateMany({ where: { userId, source: { not: "intake" } }, data: { peerName: null, peerEmail: null, publicToken: null } }),
  ]);
  await log(userId, "system", `Purged ${threads.length} intake conversation(s) — peer data deleted`);
  return NextResponse.json({ ok: true, deleted: threads.length });
}
