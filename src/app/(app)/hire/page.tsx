import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import HireClient from "./hire-client";

export const dynamic = "force-dynamic";

export default async function HirePage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;

  const jobs = await prisma.job.findMany({ where: { userId }, orderBy: { id: "desc" } });
  const matches = await prisma.match.findMany({ where: { jobOwnerId: userId, candidateState: "interested", employerState: "none" },
    include: { job: true } });
  const candidates = await Promise.all(matches.map(async m => ({
    matchId: m.id, jobTitle: m.job.title, company: m.job.company,
    person: await prisma.user.findUnique({ where: { id: m.candidateId }, select: { name: true } }),
    assistant: await prisma.assistant.findUnique({ where: { userId: m.candidateId },
      select: { capacity: true, openTo: true, publicReceipts: true, publicSlug: true, isPublic: true } }),
  })));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">You&rsquo;re hiring</h1>
      <p className="mt-1 text-sm text-neutral-500">Post a role — only people who confirmed they&rsquo;re open will see it.</p>

      <details className="mt-6 rounded-xl border bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium">+ Post a new role</summary>
        <HireClient />
      </details>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">People interested in your roles · {candidates.length}</h2>
      {candidates.length === 0 && <p className="mt-2 text-sm text-neutral-400">No one yet — they&rsquo;ll appear here as interested, sorted by fit.</p>}
      <div className="mt-3 space-y-3">
        {candidates.map(c => {
          const receipts = (c.assistant?.publicReceipts as any[] | null) ?? [];
          const verified = receipts.filter(r => (r?.coSigners ?? 0) > 0).length;
          return (
            <div key={c.matchId} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{c.person?.name ?? "Candidate"} <span className="text-sm font-normal text-neutral-500">→ {c.jobTitle}</span></p>
                {verified > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{verified} verified client{verified > 1 ? "s" : ""}</span>}
              </div>
              <p className="mt-1 text-sm text-neutral-500">{[c.assistant?.capacity, ...(c.assistant?.openTo ?? [])].filter(Boolean).join(" · ")}</p>
              <HireClient decide={{ matchId: c.matchId }} />
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">Your job ads</h2>
      <div className="mt-3 space-y-2">
        {jobs.length === 0 && <p className="text-sm text-neutral-400">None yet.</p>}
        {jobs.map(j => (
          <div key={j.id} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
            <div><p className="text-sm font-medium">{j.title}</p><p className="text-xs text-neutral-400">{j.company} · {j.status}</p></div>
            <span className="text-xs text-neutral-400">{j.rate ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
