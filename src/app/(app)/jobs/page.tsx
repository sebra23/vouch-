import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { scoreJob } from "@/lib/match/score";
import Link from "next/link";
import JobSwipe from "./job-swipe";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const me = await prisma.assistant.findUnique({ where: { userId } });
  const cand = { openTo: me?.openTo ?? [], capacity: me?.capacity ?? null, notOpenTo: me?.notOpenTo ?? [] };

  const jobs = await prisma.job.findMany({ where: { status: "open", userId: { not: userId } },
    include: { user: { select: { name: true } } }, orderBy: { id: "desc" }, take: 50 });
  const myStates = await prisma.match.findMany({ where: { candidateId: userId }, select: { jobId: true, candidateState: true } });
  const stateMap = Object.fromEntries(myStates.map(m => [m.jobId, m.candidateState]));

  const scored = jobs.map(j => ({ job: j, ...scoreJob(j, cand) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jobs for you</h1>
        <span className="text-xs text-neutral-400">invisible to your employer</span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">Matched to what you told us you want{cand.capacity ? "" : " — set your availability in Settings to rank higher"}.</p>
      {scored.length === 0 && <p className="mt-6 text-sm text-neutral-500">No matching roles yet — set what you&rsquo;re looking for in Settings.</p>}
      <div className="mt-6 space-y-3">
        {scored.map(({ job, score, reasons }) => (
          <div key={job.id} className={`rounded-xl border bg-white p-4 ${stateMap[job.id] === "interested" ? "border-emerald-300" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{score >= 80 ? "strong match" : score >= 50 ? "good match" : "new"}</span>
              <span className="text-xs text-neutral-400">{job.commitment ?? ""}</span>
            </div>
            <Link href={`/jobs/${job.id}`} className="mt-2 block font-medium hover:underline">
              {job.title} · {job.company}
            </Link>
            <p className="text-sm text-neutral-500">{[job.rate, job.location].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-xs text-neutral-400">{reasons[0]}</p>
            {!stateMap[job.id] || stateMap[job.id] === "none"
              ? <JobSwipe jobId={job.id} />
              : <p className="mt-3 text-xs text-neutral-500">{stateMap[job.id] === "interested" ? "✓ you said you're interested — waiting for them" : "passed — they'll never know"}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
