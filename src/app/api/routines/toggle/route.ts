import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session as any).userId!;
  const { key, enabled } = await req.json();
  const r = await prisma.routine.upsert({ where: { userId_key: { userId, key } },
    update: { enabled }, create: { userId, key, enabled } });
  return NextResponse.json({ ok: true, lastRunAt: r.lastRunAt });
}