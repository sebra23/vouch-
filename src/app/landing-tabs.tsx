"use client";
import { useState } from "react";

/* Agent persona tabs (Screener / Scheduler / Concierge) */
export function AgentTabs() {
  const tabs = [
    { key: "screener", label: "Screener", message: " screened 12 applicants against your essential requirements. 4 passed eligibility — each with evidence and one flagged uncertainty.",
      chip: "4 eligible · evidence attached" },
    { key: "scheduler", label: "Scheduler", message: " held two slots with Amara (Thu 10:00, Fri 14:30) and pre-sent your take-home briefing. No overlaps with your calendar.",
      chip: "2 slots held · no conflicts" },
    { key: "concierge", label: "Concierge", message: " drafted a warm decline for 8 candidates — specific, kind, sent only on your approval. Passes remain invisible to everyone else.",
      chip: "8 drafts · approval-gated" },
  ];
  const [active, setActive] = useState(tabs[0]);
  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t)}
            className="rounded-lg px-4 py-2 text-sm transition-v"
            style={t.key === active.key
              ? { background: "#111", color: "#fff" }
              : { background: "var(--pearl)", color: "var(--ink)" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl p-5" style={{ background: "var(--cream-wash)" }}>
        <p className="text-sm leading-6" style={{ color: "var(--ink)" }}>
          <b style={{ fontWeight: 500 }}>{active.label}</b>{active.message}
        </p>
        <span className="tag mt-3" style={{ background: "var(--soft-violet)" }}>{active.chip}</span>
      </div>
    </div>
  );
}

/* Audience tabs (Candidates / Founders / Hiring teams / Recruiters) */
export function AudienceTabs() {
  const audiences = [
    { key: "candidates", label: "Candidates", headline: "Get chosen without begging",
      points: ["Your agent represents you with verified evidence", "Invisible to your current employer — always", "Networking without vacancies, without cold messages"] },
    { key: "founders", label: "Founders", headline: "A shortlist, not a stack of résumés",
      points: ["5 decision-ready candidates per role, not 500", "Every recommendation explains itself", "Agents coordinate interviews while you build"] },
    { key: "teams", label: "Hiring teams", headline: "One pipeline, everyone aligned",
      points: ["Role-specific permissions and approvals", "Audit history on every agent action", "Structured screening with human control"] },
    { key: "recruiters", label: "Recruiters", headline: "Fill roles at the speed of agents",
      points: ["Candidates pre-qualified before your first call", "Reach-outs capped, structured, consented", "Your book of business compounds on-platform"] },
  ];
  const [active, setActive] = useState(audiences[0]);
  const tileColors = ["var(--petal-pink)", "var(--mint-green)", "var(--canary-yellow)", "var(--soft-violet)"];
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {audiences.map((a, i) => (
          <button key={a.key} onClick={() => setActive(a)}
            className="rounded-xl p-5 text-left transition-v"
            style={{ background: a.key === active.key ? tileColors[i] : "var(--cream-wash)", border: "1px solid var(--line)" }}>
            <p className="font-medium">{a.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h3 className="text-2xl" style={{ letterSpacing: "-0.03em" }}>{active.headline}</h3>
          <ul className="mt-4 space-y-3">
            {active.points.map((p, i) => (
              <li key={i} className="text-sm leading-6 flex gap-2.5" style={{ color: "var(--ash)" }}>
                <span style={{ color: "var(--ink)" }}>—</span>{p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-6" style={{ background: "var(--cream-wash)", border: "1px solid var(--line)" }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>what they see</p>
          <div className="mt-3 space-y-2">
            {active.points.map((p, i) => (
              <div key={i} className="rounded-lg p-3 text-sm" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                <span className="tag" style={{ background: "var(--soft-violet)", marginRight: 8 }}>agent</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
