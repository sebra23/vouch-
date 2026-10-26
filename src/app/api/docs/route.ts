import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session as any).userId!;
  const { title, content } = await req.json();
  const doc = await prisma.doc.create({ data: { userId, title: title.slice(0, 120), content: content?.slice(0, 20000) } });
  await log(userId, "system", `Document created: ${title}`);
  return NextResponse.json({ id: doc.id });
}
