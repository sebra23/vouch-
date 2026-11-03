"use client";
import { useState } from "react";
import Link from "next/link";

export type ApprovalItem = {
  id: string; tag: string; title: string; subtitle: string; reason: string; href: string; tile: string;
};

function ItemCard({ item }: { item: ApprovalItem }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${item.tile}` }}>
      <span className="tag" style={{ background: item.tile }}>{item.tag}</span>
      <p className="mt-2 font-medium">{item.title} <span className="text-sm font-normal" style={{ color: "var(--ash)" }}>{item.subtitle}</span></p>
      <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--cream-wash)", color: "var(--ink-2)" }}>{item.reason}</div>
      <div className="mt-4">
        <Link href={item.href} className="btn-primary w-full text-center sm:w-auto" style={{ height: 38, fontSize: 14 }}>Review &amp; decide</Link>
      </div>
    </div>
  );
}

export default function ApprovalToggle({ peers, companies }: { peers: ApprovalItem[]; companies: ApprovalItem[] }) {
  const [tab, setTab] = useState<"peers" | "companies">("peers");
  const list = tab === "peers" ? peers : companies;

  return (
    <div>
      {/* segmented control */}
      <div className="inline-flex rounded-xl p-1" style={{ background: "var(--cream-wash)", border: "1px solid var(--line)" }}>
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
                : "No candidates are waiting on your roles. Post a role in Hiring and matches will appear here."}
            </p>
          </div>
        )}
        {list.map(i => <ItemCard key={i.id} item={i} />)}
      </div>
    </div>
  );
}
