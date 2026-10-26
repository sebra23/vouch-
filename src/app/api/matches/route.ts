import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";

// POST /api/matches — candidate swipe { jobId, state: "interested" | "passed" }
// Employers never see passes. Mutual interest is checked on the employer side.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.jobId || !["interested", "passed"].includes(j.state))
    return NextResponse.json({ error: "bad request" }, { status: 400 });

  const job = await prisma.job.findUnique({ where: { id: j.jobId } });
  if (!job || job.status !== "open") return NextResponse.json({ error: "not found" }, { status: 404 });
  if (job.userId === userId) return NextResponse.json({ error: "own job" }, { status: 400 });

  const match = await prisma.match.upsert({
    where: { jobId_candidateId: { jobId: job.id, candidateId: userId } },
    update: { candidateState: j.state },
    create: { jobId: job.id, candidateId: userId, jobOwnerId: job.userId, candidateState: j.state },
  });
  return NextResponse.json({ ok: true, state: match.candidateState, employerState: match.employerState });
}
