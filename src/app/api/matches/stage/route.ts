import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";

// POST /api/matches/stage — move a match through the hiring funnel.
// Human approval gates every transition (EU AI Act posture): the agent prepares,
// the employer advances. { matchId, action: "advance" | "decline", note? }
const FUNNEL = ["matched", "screening", "interview", "offer", "hired"];
const STAGE_LABEL: Record<string, string> = {
  matched: "Matching", screening: "Screening", interview: "Interview", offer: "Offer", hired: "Hired",
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.matchId || !["advance", "decline"].includes(j.action))
    return NextResponse.json({ error: "bad request" }, { status: 400 });

  const match = await prisma.match.findFirst({ where: { id: j.matchId, jobOwnerId: userId }, include: { job: true } });
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (match.stage === "hired" || match.stage === "declined")
    return NextResponse.json({ error: "terminal stage" }, { status: 409 });

  if (j.action === "decline") {
    await prisma.match.update({ where: { id: match.id }, data: { stage: "declined" } });
    await prisma.interaction.create({ data: {
      initiatorId: userId, recipientId: match.candidateId, type: "reply",
      summary: `Declined at ${STAGE_LABEL[match.stage]} for "${match.job.title}" — invisible to the candidate`, status: "declined" } });
    await log(userId, "system", `Declined candidate for ${match.job.title} at ${STAGE_LABEL[match.stage]} stage`);
    return NextResponse.json({ ok: true, stage: "declined" });
  }

  const next = FUNNEL[FUNNEL.indexOf(match.stage) + 1];
  await prisma.match.update({ where: { id: match.id }, data: {
    stage: next,
    employerState: next === "hired" ? "interested" : match.employerState,
    stageNotes: j.note ? String(j.note).slice(0, 1000) : match.stageNotes } });
  await prisma.interaction.create({ data: {
    initiatorId: userId, recipientId: match.candidateId, type: "schedule",
    summary: `Advanced to ${STAGE_LABEL[next]} for "${match.job.title}"${j.note ? ` — ${String(j.note).slice(0, 120)}` : ""}`, status: "open" } });
  await log(userId, "system", `Candidate advanced to ${STAGE_LABEL[next]} for ${match.job.title}`);
  return NextResponse.json({ ok: true, stage: next });
}
