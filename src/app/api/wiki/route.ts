import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";

const KINDS = new Set(["bio", "goal", "project", "reference", "cv", "note"]);

// POST /api/wiki — create a knowledge-base entry
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.title || !j?.content || !KINDS.has(j.kind))
    return NextResponse.json({ error: "kind, title, content required" }, { status: 400 });

  const entry = await prisma.wikiPage.create({ data: {
    userId, kind: j.kind,
    title: String(j.title).slice(0, 160), content: String(j.content).slice(0, 8000),
    provenance: j.kind === "cv" && j.imported ? "imported" : "self-declared",
  }});
  await log(userId, "system", `Wiki updated: ${j.kind} "${entry.title}"`);
  return NextResponse.json({ ok: true, id: entry.id });
}

// DELETE /api/wiki?id=... — remove an entry
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.wikiPage.deleteMany({ where: { id, userId } }); // scoped: only own entries
  return NextResponse.json({ ok: true });
}
