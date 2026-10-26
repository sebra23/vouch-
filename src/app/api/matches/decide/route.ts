import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";
import { isMatch } from "@/lib/match/score";

// POST /api/matches/decide — employer swipe { matchId, state: "interested" | "passed" }
// Mutual interest → match: shared thread created, both parties notified.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.matchId || !["interested", "passed"].includes(j.state))
    return NextResponse.json({ error: "bad request" }, { status: 400 });

  const match = await prisma.match.findFirst({ where: { id: j.matchId, jobOwnerId: userId }, include: { job: true } });
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });

  const nowMatched = isMatch(match.candidateState, j.state);
  const threadId = nowMatched && !match.threadId ? `mt-${match.id}` : match.threadId;

  await prisma.match.update({ where: { id: match.id }, data: {
    employerState: j.state,
    matchedAt: nowMatched ? new Date() : null,
    ...(threadId ? { threadId } : {}),
  }});

  if (nowMatched && !match.matchedAt) {
    const candidate = await prisma.user.findUnique({ where: { id: match.candidateId } });
    const thread = await prisma.thread.create({ data: {
      id: threadId!, userId: match.jobOwnerId, title: `Match: ${candidate?.name ?? "candidate"} × ${match.job.title}`,
      source: "owner" } });
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant",
      content: `You matched on "${match.job.title}" @ ${match.job.company}. Your assistants will handle scheduling — propose times here.` } });
    // Candidate-side thread: each party talks with their OWN assistant about the match
    // (agent-mediated by design — no raw candidate↔employer chat in v0.1).
    const cThread = await prisma.thread.create({ data: { id: `${threadId}-c`, userId: match.candidateId,
      title: `Match: ${match.job.title} @ ${match.job.company}`, source: "owner" } });
    await prisma.message.create({ data: { threadId: cThread.id, role: "assistant",
      content: `You matched with ${match.job.company} on "${match.job.title}". Your assistant will coordinate scheduling — share your availability here.` } });
    await log(match.jobOwnerId, "system", `New match: ${candidate?.name ?? "candidate"} for ${match.job.title}`);
  }
  return NextResponse.json({ ok: true, matched: nowMatched, threadId: nowMatched ? threadId : null });
}
