import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ROUTINES = [
  { key: "auto-inbox", title: "Auto-inbox" }, { key: "morning-briefing", title: "Morning Briefing" },
  { key: "meeting-briefing", title: "Meeting Briefing" }, { key: "loose-ends", title: "Loose-Ends Sweep" },
];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ threads: [], wiki: [], routines: [] });
  const userId = (session as any).userId!;
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase() ?? "";

  const [threads, wiki] = await Promise.all([
    prisma.thread.findMany({ where: { userId, OR: [{ title: { contains: q, mode: "insensitive" } },
      { messages: { some: { content: { contains: q, mode: "insensitive" } } } }] }, take: 8,
      select: { id: true, title: true } }),
    prisma.wikiPage.findMany({ where: { userId, title: { contains: q, mode: "insensitive" } }, take: 8,
      select: { id: true, title: true } }),
  ]);
  return NextResponse.json({ threads, wiki, routines: ROUTINES.filter(r => r.title.toLowerCase().includes(q)) });
}
