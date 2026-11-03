"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ApprovalItem = {
  id: string; tag: string; title: string; subtitle: string; reason: string;
  href: string; tile: string;
  matchId?: string; stage?: string;
};

const STAGE_ACTION: Record<string, string> = {
  matched: "Review & introduce",
  screening: "Advance to interview",
  interview: "Confirm interview",
  offer: "Send offer",
};
const STAGE_TAG: Record<string, string> = {
  matched: "Matching", screening: "Screening", interview: "Interview", offer: "Offer",
};

function ItemCard({ item }: { item: ApprovalItem }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  async function act(action: "advance" | "decline") {
    if (busy || !item.matchId) return;
    setBusy(true);
    const r = await fetch("/api/matches/stage", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: item.matchId, action }) });
    setBusy(false);
    if (r.ok) { setDone(action); router.refresh(); }
  }

  if (done) return (
    <div className="card card-filled">
      <p className="text-sm" style={{ color: "var(--ink-2)" }}>
        {done === "advance" ? <>Advanced to the next stage — the candidate&rsquo;s agent has been notified.</> : <>Declined — invisible to the candidate, no email sent.</>}
      </p>
    </div>
  );

  return (
    <div className="card" style={{ borderTop: `3px solid ${item.tile}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag" style={{ background: item.tile }}>{item.tag}</span>
        {item.stage && <span className="chip">{STAGE_TAG[item.stage] ?? item.stage}</span>}
      </div>
      <p className="mt-2 font-medium">{item.title} <span className="text-sm font-normal" style={{ color: "var(--ash)" }}>{item.subtitle}</span></p>
      <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--cream-wash)", color: "var(--ink-2)" }}>{item.reason}</div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {item.matchId ? (
          <>
            <button onClick={() => act("advance")} disabled={busy} className="btn-primary" style={{ height: 38, fontSize: 14 }}>
              {STAGE_ACTION[item.stage ?? "matched"]} →
            </button>
            <button onClick={() => act("decline")} disabled={busy} className="btn-ghost" style={{ height: 38, fontSize: 14 }}>
              {item.stage === "matched" ? "Pass — invisible" : "Decline"}
            </button>
          </>
        ) : (
          <Link href={item.href} className="btn-primary text-center" style={{ height: 38, fontSize: 14 }}>Review &amp; decide</Link>
        )}
      </div>
    </div>
  );
}

export default function ApprovalToggle({ peers, companies }: { peers: ApprovalItem[]; companies: ApprovalItem[] }) {
  const [tab, setTab] = useState<"peers" | "companies">(peers.length > 0 ? "peers" : "companies");
  const list = tab === "peers" ? peers : companies;

  return (
    <div>
      <div className="inline-flex rounded-xl p-1" style={{ background: "var(--canvas)", border: "1px solid var(--line)" }}>
        {([["peers", "Peer requests", peers.length], ["companies", "Company requests", companies.length]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-v"
            style={tab === key ? { background: "#111", color: "#fff" } : { color: "var(--ash)" }}>
            {label}
            <span className="rounded-full px-1.5 text-xs"
              style={tab === key ? { background: "rgba(255,255,255,0.2)" } : { background: "var(--pearl)" }}>{count}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <div className="card card-filled">
            <p className="text-sm font-medium">None here</p>
            <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>
              {tab === "peers"
                ? "No one has reached your public page yet. When they do, their requests land here — qualified by your agent first."
                : "No candidates are waiting on your roles. Post a role in Hiring and matches will appear here at the Matching stage."}
            </p>
          </div>
        )}
        {list.map(i => <ItemCard key={i.id} item={i} />)}
      </div>
    </div>
  );
}
