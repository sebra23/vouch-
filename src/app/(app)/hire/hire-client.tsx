"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Dual-purpose client component: job creation form (no props) and
// employer decision buttons (decide={matchId}).
export default function HireClient({ decide }: { decide?: { matchId: string } }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function decideFn(state: "interested" | "passed") {
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/matches/decide", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: decide!.matchId, state }) });
    setBusy(false);
    if (r.ok) { setDone(true); router.refresh(); }
  }

  if (decide) {
    if (done) return <p className="mt-3 text-xs text-neutral-500">done — they&rsquo;ll be notified if it&rsquo;s a mutual yes</p>;
    return (
      <div className="mt-3 flex gap-2">
        <button onClick={() => decideFn("interested")} disabled={busy}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">I&rsquo;m interested</button>
        <button onClick={() => decideFn("passed")} disabled={busy}
          className="rounded-lg border px-4 py-2 text-sm text-neutral-500 disabled:opacity-50">Pass — invisible</button>
      </div>
    );
  }

  const [f, setF] = useState({ company: "", title: "", description: "", rate: "", commitment: "", location: "", industry: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false);
    if (r.ok) { setDone(true); router.refresh(); }
  }

  if (done) return <p className="mt-4 text-sm text-emerald-700">✓ ad is live — matching candidates see it now</p>;

  const field = "mt-3 block w-full rounded-lg border p-2.5 text-sm";
  return (
    <form onSubmit={create} className="mt-4">
      <input className={field} placeholder="Company" required value={f.company} onChange={e => setF({ ...f, company: e.target.value })} />
      <input className={field} placeholder="Role title — e.g. Fractional CTO" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <textarea className={field} placeholder="What the work is, honestly. What they'd actually do." required rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <input className={field + " mt-0"} placeholder="Pay — €140/h" value={f.rate} onChange={e => setF({ ...f, rate: e.target.value })} />
        <input className={field + " mt-0"} placeholder="Commitment — 12h/wk" value={f.commitment} onChange={e => setF({ ...f, commitment: e.target.value })} />
        <input className={field + " mt-0"} placeholder="Location — remote EU" value={f.location} onChange={e => setF({ ...f, location: e.target.value })} />
        <input className={field + " mt-0"} placeholder="Industry — fintech" value={f.industry} onChange={e => setF({ ...f, industry: e.target.value })} />
      </div>
      <button disabled={busy} className="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Posting…" : "Post role"}
      </button>
    </form>
  );
}
