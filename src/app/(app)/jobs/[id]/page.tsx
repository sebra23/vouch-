import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { scoreJob } from "@/lib/match/score";
import { notFound } from "next/navigation";
import JobSwipe from "../job-swipe";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const job = await prisma.job.findUnique({ where: { id: params.id },
    include: { user: { select: { name: true } } } });
  if (!job || job.status !== "open") notFound();

  const me = await prisma.assistant.findUnique({ where: { userId } });
  const cand = { openTo: me?.openTo ?? [], capacity: me?.capacity ?? null, notOpenTo: me?.notOpenTo ?? [] };
  const { score, reasons } = scoreJob(job, cand);
  const match = await prisma.match.findUnique({ where: { jobId_candidateId: { jobId: job.id, candidateId: userId } } });

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">{job.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{job.company} · posted by {job.user.name ?? "the founder"}</p>
      <div className="mt-5 rounded-xl border bg-white p-5 text-sm leading-6">
        <p><b className="font-medium">{[job.rate, job.commitment, job.location].filter(Boolean).join(" · ")}</b></p>
        <p className="mt-3 whitespace-pre-wrap text-neutral-700">{job.description}</p>
      </div>
      <div className="mt-5 rounded-xl border bg-white p-5">
        <p className="text-sm font-medium">why we picked this for you</p>
        <ul className="mt-2 list-disc pl-5 text-sm text-neutral-500">
          {reasons.map((r, i) => <li key={i}>{r}</li>)}
          {!reasons.length && <li>new role in your area</li>}
        </ul>
      </div>
      <div className="mt-6">
        {match && match.candidateState !== "none"
          ? <p className="text-sm text-neutral-600">{match.candidateState === "interested" ? "✓ you're interested — we'll tell you the moment they respond" : "you passed — invisible, no awkwardness"}</p>
          : <JobSwipe jobId={job.id} />}
      </div>
    </div>
  );
}
