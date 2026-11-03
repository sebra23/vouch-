import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  outreach: "reached out", intro_request: "requested introduction", reply: "replied",
  match: "mutual match", screen: "screened", schedule: "scheduled",
};
const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "awaiting response", color: "#8A5A00", bg: "#FDF3E0" },
  accepted: { label: "accepted", color: "var(--success)", bg: "var(--success-soft)" },
  declined: { label: "declined", color: "var(--ink-2)", bg: "var(--surface-muted)" },
  completed: { label: "completed", color: "var(--ink-2)", bg: "var(--surface-muted)" },
};

export default async function NetworkPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;

  const interactions = await prisma.interaction.findMany({
    where: { OR: [{ initiatorId: userId }, { recipientId: userId }] },
    orderBy: { id: "desc" }, take: 50 });

  // Enrich with the other party's display identity
  const enriched = await Promise.all(interactions.map(async i => {
    const otherId = i.initiatorId === userId ? i.recipientId : i.initiatorId;
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { name: true } });
    const company = i.companyId ? await prisma.company.findUnique({ where: { id: i.companyId } }) : null;
    const job = await prisma.job.findFirst({ where: { userId: otherId, status: "open" } });
    return { i, otherName: company?.name ?? other?.name ?? "someone", slug: company?.slug ?? null, direction: i.initiatorId === userId ? "sent" as const : "received" as const, hasJobs: !!job };
  }));

  const companies = await prisma.company.findMany({ where: { ownerId: { not: userId } }, take: 6 });
  const accepted = enriched.filter(e => e.i.status === "accepted" || e.i.status === "completed").length;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold" style={{ letterSpacing: "-0.3px" }}>Your network</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        How your agent has interacted with company agents — {accepted} active relationship{accepted === 1 ? "" : "s"}.
      </p>

      {/* Interaction timeline: the network visualization (list-first per spec §7) */}
      {enriched.length > 0 && <>
        <div className="mt-6 flex gap-6">
          {enriched.slice(0, 14).reverse().map(({ i, otherName, direction }, idx) => (
            <div key={i.id} className="flex flex-col items-center gap-1" title={`${otherName}: ${i.summary}`}>
              <div style={{ width: 10, height: 10, borderRadius: 99,
                background: i.status === "accepted" || i.status === "completed" ? "var(--success)" : i.status === "declined" ? "var(--ink-3)" : "var(--amber)" }} />
              {idx < 13 && <div style={{ position: "absolute" }} />}
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          {enriched.map(({ i, otherName, slug, direction }) => {
            const st = STATUS_STYLE[i.status] ?? STATUS_STYLE.open;
            return (
              <div key={i.id} className="card flex items-center justify-between gap-4" style={{ padding: "12px 16px" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span style={{ fontSize: 11, color: "var(--ink-3)", width: 52, flexShrink: 0 }}>{direction === "sent" ? "you →" : "→ you"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {slug ? <Link href={`/c/${slug}`} style={{ color: "var(--ink)" }} className="hover:underline">{otherName}</Link> : otherName}
                      <span style={{ color: "var(--ink-3)", fontWeight: 400 }}> · {TYPE_LABEL[i.type] ?? i.type}</span>
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--ink-2)" }}>{i.summary}</p>
                  </div>
                </div>
                <span className="chip shrink-0" style={{ color: st.color, background: st.bg }}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </>}

      {enriched.length === 0 && <div className="card mt-6">
        <p className="text-sm font-medium">No interactions yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>Your professional network starts with the companies worth knowing. When your agent reaches out — or a company&rsquo;s agent reaches you — every exchange is recorded here with its status.</p>
      </div>}

      {/* Discover companies (agent-curated, no generic "Connect") */}
      <h2 className="mt-10 text-sm font-medium" style={{ color: "var(--ink-2)" }}>Companies worth knowing</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {companies.map(c => (
          <Link key={c.id} href={`/c/${c.slug}`} className="card transition-v hover:border-[var(--ink-3)] block">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              {c.verified && <span className="chip chip-verified">verified</span>}
            </div>
            <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--ink-2)" }}>{c.description ?? c.industry ?? ""}</p>
            <p className="mt-2 text-xs" style={{ color: "var(--amber)" }}>view company →</p>
          </Link>
        ))}
        {companies.length === 0 && <p className="text-sm col-span-2" style={{ color: "var(--ink-3)" }}>No companies registered yet — be the first to claim yours in Settings.</p>}
      </div>
    </div>
  );
}
