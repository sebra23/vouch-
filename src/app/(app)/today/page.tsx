import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { tag: string; tile: string }> = {
  intake: { tag: "introduction request", tile: "var(--soft-violet)" },
  match: { tag: "interested in your role", tile: "var(--mint-green)" },
};

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const firstName = (me?.name ?? "there").split(" ")[0];

  const pendingIntakes = await prisma.thread.findMany({ where: { userId, source: "intake", status: "awaiting_owner" },
    orderBy: { id: "desc" } });
  const pendingPeople = await prisma.match.findMany({ where: { jobOwnerId: userId, candidateState: "interested", employerState: "none" },
    include: { job: true } });
  const needsYou = pendingIntakes.length + pendingPeople.length;

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const actionsThisWeek = await prisma.appLog.count({ where: { userId, createdAt: { gte: weekAgo } } });
  const accepted = await prisma.interaction.count({ where: { OR: [{ initiatorId: userId }, { recipientId: userId }], status: { in: ["accepted", "completed"] } } });
  const activity = await prisma.appLog.findMany({ where: { userId }, orderBy: { id: "desc" }, take: 6 });

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      {/* greeting */}
      <h1 className="text-2xl md:text-[28px]" style={{ letterSpacing: "-0.03em", fontWeight: 400 }}>
        {greeting}, {firstName}
      </h1>
      <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--ash)" }}>
        {needsYou > 0
          ? <><b style={{ fontWeight: 500, color: "var(--ink)" }}>{needsYou} item{needsYou > 1 ? "s" : ""}</b> need{needsYou === 1 ? "s" : ""} your approval. Zero action is taken without you.</>
          : <>Nothing needs your decision right now. Silence is a valid, successful state.</>}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        {/* ── approval queue ── */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>Needs your approval</h2>
            {needsYou > 0 && <span className="tag" style={{ background: "var(--pearl)" }}>{needsYou}</span>}
          </div>

          {needsYou === 0 && (
            <div className="card mt-3">
              <p className="text-sm font-medium">All clear</p>
              <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>Your agent is working in the background. New requests will appear here — never in an inbox flood.</p>
            </div>
          )}

          <div className="mt-3 space-y-3">
            {pendingIntakes.map(t => (
              <div key={t.id} className="card" style={{ borderTop: "3px solid var(--soft-violet)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="tag" style={{ background: "var(--soft-violet)" }}>{TYPE_META.intake.tag}</span>
                    <p className="mt-2 font-medium">{t.peerName}</p>
                    <p className="text-sm" style={{ color: "var(--ash)" }}>via your public page</p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--cream-wash)", color: "var(--ink-2)" }}>
                  {t.title.replace(/^Intake: /, "")} reached out. Your agent has already started qualifying the request.
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link href={`/chat/${t.id}`} className="btn-primary text-center" style={{ height: 38, fontSize: 14 }}>Review &amp; decide</Link>
                  <span className="hidden text-sm sm:inline" style={{ color: "var(--stone)" }}>agent conversation attached</span>
                </div>
              </div>
            ))}

            {await Promise.all(pendingPeople.map(async m => {
              const c = await prisma.user.findUnique({ where: { id: m.candidateId }, select: { name: true } });
              const asst = await prisma.assistant.findUnique({ where: { userId: m.candidateId }, select: { capacity: true } });
              return (
                <div key={m.id} className="card" style={{ borderTop: "3px solid var(--mint-green)" }}>
                  <span className="tag" style={{ background: "var(--mint-green)" }}>{TYPE_META.match.tag}</span>
                  <p className="mt-2 font-medium">{c?.name ?? "A candidate"} <span className="text-sm font-normal" style={{ color: "var(--ash)" }}>→ {m.job.title}</span></p>
                  <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--cream-wash)", color: "var(--ink-2)" }}>
                    Matches your requirements{asst?.capacity ? ` · ${asst.capacity}` : ""}{m.job.rate ? ` · ${m.job.rate}` : ""}. Pass is invisible — they never see a no.
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Link href="/hire" className="btn-primary text-center" style={{ height: 38, fontSize: 14 }}>Review candidate</Link>
                    <span className="hidden text-sm sm:inline" style={{ color: "var(--stone)" }}>evidence attached</span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* ── side rail ── */}
        <div className="space-y-4">
          {/* dark stat card */}
          <div className="rounded-xl p-5 text-white" style={{ background: "#111" }}>
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

          {/* quick nav tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[{ l: "Jobs", h: "/jobs", t: "var(--soft-violet)" }, { l: "Network", h: "/network", t: "var(--petal-pink)" }, { l: "Wiki", h: "/wiki", t: "var(--mint-green)" }].map(x => (
              <Link key={x.l} href={x.h} className="rounded-xl p-3 text-center transition-v"
                style={{ background: x.t }}>
                <p className="text-sm font-medium">{x.l}</p>
              </Link>
            ))}
          </div>

          {/* privacy note */}
          <div className="rounded-xl p-4" style={{ background: "var(--cream-wash)", border: "1px solid var(--line)" }}>
            <p className="text-xs font-medium">Your privacy cloak is active</p>
            <p className="mt-1 text-xs leading-5" style={{ color: "var(--ash)" }}>
              Your current employer cannot see your profile, matches, or activity. <Link href="/settings" style={{ color: "var(--ink)" }} className="underline underline-offset-2">Manage</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── while you were away ── */}
      <h2 className="mt-10 text-sm font-medium" style={{ color: "var(--ink-2)" }}>While you were away</h2>
      {activity.length === 0 ? (
        <div className="card mt-3">
          <p className="text-sm" style={{ color: "var(--ash)" }}>Your agent has nothing to report yet. As soon as it acts — a match, a reply, a draft — it logs the evidence here.</p>
        </div>
      ) : (
        <div className="card mt-3 space-y-3.5">
          {activity.map(l => (
            <div key={l.id} className="flex gap-3 text-sm">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: l.source === "intake" ? "var(--soft-violet)" : l.source === "system" ? "var(--mint-green)" : "var(--pearl)" }} />
              <div>
                <p style={{ color: "var(--ink)" }}>{l.message}</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--stone)" }}>{l.source} · {l.createdAt?.toLocaleString?.() ?? ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs" style={{ color: "var(--stone)" }}>
        Your agent works. You decide. — <Link href="/logs" style={{ color: "var(--ink)" }} className="underline underline-offset-2">full activity log</Link>
      </p>
    </div>
  );
}
