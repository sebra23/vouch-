import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const firstName = (me?.name ?? "there").split(" ")[0];

  // Everything awaiting a human decision (agents never act on these alone)
  const pendingIntakes = await prisma.thread.findMany({ where: { userId, source: "intake", status: "awaiting_owner" },
    orderBy: { id: "desc" } });
  const pendingPeople = await prisma.match.findMany({ where: { jobOwnerId: userId, candidateState: "interested", employerState: "none" },
    include: { job: true } });
  const needsYou = pendingIntakes.length + pendingPeople.length;

  // What the agent did while away
  const activity = await prisma.appLog.findMany({ where: { userId }, orderBy: { id: "desc" }, take: 8 });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold" style={{ letterSpacing: "-0.3px" }}>Good morning, {firstName}</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        {needsYou > 0
          ? <>{needsYou} item{needsYou > 1 ? "s" : ""} need{needsYou === 1 ? "s" : ""} your decision. Zero action is taken without you.</>
          : <>Nothing needs your decision right now. Silence is a valid, successful state.</>}
      </p>

      {needsYou > 0 && <>
        <h2 className="mt-8 text-sm font-medium" style={{ color: "var(--ink-2)" }}>Needs your approval</h2>
        <div className="mt-3 space-y-3">
          {pendingIntakes.map(t => (
            <div key={t.id} className="card" style={{ borderColor: "var(--amber)", borderWidth: 1 }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="tag">introduction request</span>
                  <p className="mt-1.5 font-medium">{t.peerName} <span className="text-sm font-normal" style={{ color: "var(--ink-2)" }}>via your public page</span></p>
                </div>
                <Link href={`/chat/${t.id}`} className="btn-primary inline-flex items-center" style={{ height: 36, fontSize: 13 }}>Review &amp; decide</Link>
              </div>
            </div>
          ))}
          {pendingPeople.map(async m => {
            const c = await prisma.user.findUnique({ where: { id: m.candidateId }, select: { name: true } });
            return (
              <div key={m.id} className="card" style={{ borderColor: "var(--amber)", borderWidth: 1 }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="tag">interested in your role</span>
                    <p className="mt-1.5 font-medium">{c?.name ?? "A candidate"} <span className="text-sm font-normal" style={{ color: "var(--ink-2)" }}>→ {m.job.title}</span></p>
                  </div>
                  <Link href="/hire" className="btn-primary inline-flex items-center" style={{ height: 36, fontSize: 13 }}>Review</Link>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      <h2 className="mt-10 text-sm font-medium" style={{ color: "var(--ink-2)" }}>While you were away</h2>
      {activity.length === 0
        ? <p className="mt-3 text-sm" style={{ color: "var(--ink-3)" }}>Your agent has nothing to report yet.</p>
        : <div className="card mt-3 space-y-2.5">
            {activity.map(l => (
              <div key={l.id} className="flex gap-2.5 text-sm">
                <span style={{ color: "var(--ink-3)" }}>•</span>
                <span style={{ color: "var(--ink-2)" }}>{l.message}</span>
              </div>
            ))}
          </div>}

      <p className="mt-10 text-xs" style={{ color: "var(--ink-3)" }}>
        Your agent works. You decide. — <Link href="/logs" style={{ color: "var(--amber)" }}>full activity log</Link>
      </p>
    </div>
  );
}
