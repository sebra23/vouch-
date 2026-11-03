import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";
import ApprovalToggle, { type ApprovalItem } from "./approval-toggle";

export const dynamic = "force-dynamic";

const SPARKLE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l2.1 6.9L21 11l-6.9 2.1L12 20l-2.1-6.9L3 11l6.9-2.1L12 2z" />
  </svg>
);
const SHIELD = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    <path d="M9 11.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const firstName = (me?.name ?? "there").split(" ")[0];

  const pendingIntakes = await prisma.thread.findMany({ where: { userId, source: "intake", status: "awaiting_owner" },
    orderBy: { id: "desc" } });
  const pendingPeople = await prisma.match.findMany({ where: { jobOwnerId: userId, candidateState: "interested", employerState: "none" },
    include: { job: true } });

  const peerItems: ApprovalItem[] = pendingIntakes.map(t => ({
    id: t.id, tag: "introduction request", tile: "var(--soft-violet)",
    title: t.peerName ?? "Someone", subtitle: "via your public page",
    reason: "Your agent has started qualifying the request — conversation attached.",
    href: `/chat/${t.id}`,
  }));
  const companyItems: ApprovalItem[] = await Promise.all(pendingPeople.map(async m => {
    const c = await prisma.user.findUnique({ where: { id: m.candidateId }, select: { name: true } });
    return {
      id: m.id, tag: "interested in your role", tile: "var(--mint-green)",
      title: c?.name ?? "A candidate", subtitle: `→ ${m.job.title}`,
      reason: `Matches your requirements${m.job.rate ? ` · ${m.job.rate}` : ""}. Pass is invisible — they never see a no.`,
      href: "/hire",
    };
  }));
  const needsYou = peerItems.length + companyItems.length;

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const actionsThisWeek = await prisma.appLog.count({ where: { userId, createdAt: { gte: weekAgo } } });
  const accepted = await prisma.interaction.count({ where: { OR: [{ initiatorId: userId }, { recipientId: userId }], status: { in: ["accepted", "completed"] } } });
  const activity = await prisma.appLog.findMany({ where: { userId }, orderBy: { id: "desc" }, take: 6 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full" style={{ background: "var(--cream-wash)" }}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        {/* greeting */}
        <h1 className="text-2xl md:text-[28px]" style={{ letterSpacing: "-0.03em", fontWeight: 400 }}>
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--ash)" }}>
          {needsYou > 0
            ? <><b style={{ fontWeight: 500, color: "var(--ink)" }}>{needsYou} item{needsYou > 1 ? "s" : ""}</b> need{needsYou === 1 ? "s" : ""} your approval. Zero action is taken without you.</>
            : <>Nothing needs your decision right now. Silence is a valid, successful state.</>}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── left: approval queue with peer/company toggle ── */}
          <div>
            <h2 className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>Needs your approval</h2>
            <div className="mt-3">
              <ApprovalToggle peers={peerItems} companies={companyItems} />
            </div>
          </div>

          {/* ── right rail (desktop) / below (mobile) ── */}
          <div className="space-y-4">
            {/* dark stat card */}
            <div className="rounded-xl p-5 text-white" style={{ background: "#111", boxShadow: "var(--shadow-xl)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>This week</p>
                <span className="tag" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>agents on</span>
              </div>
              <p className="mt-3 text-3xl" style={{ letterSpacing: "-0.03em" }}>{actionsThisWeek}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>agent actions logged</p>
              <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>Active relationships</span>
                  <span className="font-medium">{accepted}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>Awaiting you</span>
                  <span className="font-medium" style={{ color: needsYou > 0 ? "#ffcf9e" : undefined }}>{needsYou}</span>
                </div>
              </div>
            </div>

            {/* while you were away — moved to right rail, icon + structured items */}
            <div className="card">
              <div className="flex items-center gap-2" style={{ color: "var(--inbound)" }}>
                {SPARKLE}
                <h2 className="text-sm font-medium" style={{ color: "var(--ink)" }}>While you were away</h2>
              </div>
              {activity.length === 0 ? (
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--ash)" }}>
                  Your agent has nothing to report yet. As soon as it acts — a match, a reply, a draft — it logs the evidence here.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {activity.map(l => (
                    <div key={l.id} className="flex gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: l.source === "intake" ? "var(--soft-violet)" : l.source === "system" ? "var(--mint-green)" : "var(--pearl)" }} />
                      <div>
                        <p className="text-sm font-medium leading-5">{l.message.split("—")[0].split("·")[0].trim()}</p>
                        <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--ash)" }}>
                          {l.source === "intake" ? "Someone reached out — your agent is qualifying it." :
                           l.source === "system" ? "Platform event recorded." : "Agent activity."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* privacy row */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "var(--canvas)", border: "1px solid var(--line)" }}>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--ink-2)" }}>
                <span style={{ color: "var(--success)" }}>{SHIELD}</span>
                Your privacy cloak is fully active.
              </div>
              <Link href="/settings" className="text-sm font-medium" style={{ color: "var(--ink)" }}>Settings</Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs" style={{ color: "var(--stone)" }}>
          Your agent works. You decide. — <Link href="/logs" style={{ color: "var(--ink)" }} className="underline underline-offset-2">full activity log</Link>
        </p>
      </div>
    </div>
  );
}
