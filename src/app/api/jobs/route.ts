import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";

// POST /api/jobs — employer creates a job ad (intent declaration).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.title || !j?.company || !j?.description)
    return NextResponse.json({ error: "title, company, description required" }, { status: 400 });

  const job = await prisma.job.create({ data: {
    userId, company: String(j.company).slice(0, 120), title: String(j.title).slice(0, 120),
    description: String(j.description).slice(0, 4000),
    rate: j.rate ? String(j.rate).slice(0, 60) : null,
    commitment: j.commitment ? String(j.commitment).slice(0, 60) : null,
    location: j.location ? String(j.location).slice(0, 80) : null,
    industry: j.industry ? String(j.industry).slice(0, 60) : null,
  }});
  await log(userId, "system", `Job ad live: ${job.title} @ ${job.company}`);
  return NextResponse.json({ ok: true, id: job.id });
}

// GET /api/jobs/mine — employer's own ads.
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const jobs = await prisma.job.findMany({ where: { userId }, orderBy: { id: "desc" } });
  return NextResponse.json({ jobs });
}
