import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;

  const asCandidate = await prisma.match.findMany({ where: { candidateId: userId, matchedAt: { not: null } }, include: { job: true } });
  const asEmployer = await prisma.match.findMany({ where: { jobOwnerId: userId, matchedAt: { not: null } }, include: { job: true } });

  const Row = ({ title, sub, href }: { title: string; sub: string; href: string }) => (
    <Link href={href} className="block rounded-xl border bg-white p-4 hover:border-neutral-300">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{sub}</p>
      <p className="mt-2 text-xs text-neutral-400">your assistant is coordinating — open the thread →</p>
    </Link>
  );

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">Matches</h1>
      <p className="mt-1 text-sm text-neutral-500">mutual yeses only — every conversation here already has both sides in.</p>

      <h2 className="mt-6 text-sm font-medium text-neutral-500">as a candidate</h2>
      <div className="mt-3 space-y-3">
        {asCandidate.length === 0 && <p className="text-sm text-neutral-400">none yet — swipe on jobs you like.</p>}
        {asCandidate.map(m => <Row key={m.id} title={`${m.job.title} @ ${m.job.company}`}
          sub={`${[m.job.rate, m.job.commitment].filter(Boolean).join(" · ")}`}
          href={`/chat/${m.threadId}-c`} />)}
      </div>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">as an employer</h2>
      <div className="mt-3 space-y-3">
        {asEmployer.length === 0 && <p className="text-sm text-neutral-400">none yet — respond to interested people in Hiring.</p>}
        {asEmployer.map(async m => {
          const c = await prisma.user.findUnique({ where: { id: m.candidateId }, select: { name: true } });
          return <Row key={m.id} title={`${c?.name ?? "Candidate"} — ${m.job.title}`} sub={m.job.company} href={`/chat/${m.threadId}`} />;
        })}
      </div>
    </div>
  );
}
