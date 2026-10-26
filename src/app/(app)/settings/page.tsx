"use client";
import { useState, useEffect } from "react";

type Me = { email: string; name: string; timezone: string; plan: string;
  pendingIntakes?: number;
  assistant: { name: string; personality: string; isPublic?: boolean; publicSlug?: string | null;
    tagline?: string | null; openTo?: string[]; notOpenTo?: string[]; capacity?: string | null;
    publicReceipts?: { title: string; detail?: string; coSigners?: number }[] | null } | null;
  scheduling: { workingHours?: string; distribution?: string; recurring?: string } };

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetch("/api/me").then(r => r.json()).then(setMe); }, []);
  if (!me) return <div className="p-8 text-sm text-neutral-400">Loading…</div>;

  async function save(patch: Partial<Me>) {
    const next = { ...me, ...patch } as Me;
    setMe(next);
    setSaved(false);
    await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setSaved(true);
  }

  const sched = me.scheduling ?? {};

  return (
    <div className="max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Settings</h1>
      {saved && <p className="mt-2 text-sm text-green-600">Saved.</p>}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500">Profile</h2>
        <div className="mt-3 rounded-xl border bg-white p-5">
          <div className="text-sm text-neutral-500">{me.email}</div>
          <div className="mt-1 text-sm capitalize text-neutral-500">{me.plan} plan</div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500">Assistant</h2>
        <div className="mt-3 space-y-3 rounded-xl border bg-white p-5">
          <label className="block text-sm">Name
            <input className="mt-1 w-full rounded-lg border p-2.5" value={me.assistant?.name ?? ""}
              onChange={e => save({ assistant: { ...(me.assistant ?? { personality: "" }), name: e.target.value, personality: me.assistant?.personality ?? "" } })} />
          </label>
          <label className="block text-sm">Personality
            <textarea className="mt-1 w-full rounded-lg border p-2.5" rows={2} value={me.assistant?.personality ?? ""}
              onChange={e => save({ assistant: { name: me.assistant?.name ?? "", personality: e.target.value } })} />
          </label>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500">Public page</h2>
        <div className="mt-3 space-y-4 rounded-xl border bg-white p-5">
          <label className="flex items-center justify-between text-sm">
            <span>Give {me.assistant?.name ?? "your agent"} a public page</span>
            <input type="checkbox" className="h-4 w-4" checked={me.assistant?.isPublic ?? false}
              onChange={e => save({ assistant: { name: me.assistant?.name ?? "", personality: me.assistant?.personality ?? "",
                isPublic: e.target.checked, publicSlug: me.assistant?.publicSlug, tagline: me.assistant?.tagline,
                openTo: me.assistant?.openTo, notOpenTo: me.assistant?.notOpenTo, capacity: me.assistant?.capacity,
                publicReceipts: me.assistant?.publicReceipts },
                ...(e.target.checked ? {} : {}) })} />
          </label>
          {me.assistant?.isPublic && <>
            {me.assistant.publicSlug && (
              <p className="text-sm">Live at <a className="font-medium underline underline-offset-2" target="_blank"
                href={`/a/${me.assistant.publicSlug}`}>/a/{me.assistant.publicSlug}</a></p>)}
            <label className="block text-sm">Tagline
              <input className="mt-1 w-full rounded-lg border p-2.5" placeholder="One line, in your agent's voice"
                value={me.assistant.tagline ?? ""}
                onChange={e => save({ assistant: { ...me.assistant!, tagline: e.target.value } as any })} />
            </label>
            <label className="block text-sm">Capacity
              <input className="mt-1 w-full rounded-lg border p-2.5" placeholder="e.g. 12h/wk from Nov 3"
                value={me.assistant.capacity ?? ""}
                onChange={e => save({ assistant: { ...me.assistant!, capacity: e.target.value } as any })} />
            </label>
            <label className="block text-sm">Open to (comma-separated)
              <input className="mt-1 w-full rounded-lg border p-2.5" placeholder="fractional-cto, advisory"
                value={(me.assistant.openTo ?? []).join(", ")}
                onChange={e => save({ assistant: { ...me.assistant!, openTo: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } as any })} />
            </label>
            <label className="block text-sm">Not open to
              <input className="mt-1 w-full rounded-lg border p-2.5" placeholder="full-time, web3"
                value={(me.assistant.notOpenTo ?? []).join(", ")}
                onChange={e => save({ assistant: { ...me.assistant!, notOpenTo: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } as any })} />
            </label>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Work receipts</span>
                <button className="text-xs text-neutral-500 underline" onClick={() => save({ assistant: { ...me.assistant!,
                  publicReceipts: [...(me.assistant?.publicReceipts ?? []), { title: "New receipt", detail: "", coSigners: 0 }] } as any })}>+ Add</button>
              </div>
              {(me.assistant.publicReceipts ?? []).map((r, i) => (
                <div key={i} className="mt-2 flex gap-2">
                  <input className="w-full rounded-lg border p-2" value={r.title} placeholder="Title"
                    onChange={e => { const rs = [...(me.assistant?.publicReceipts ?? [])]; rs[i] = { ...r, title: e.target.value };
                      save({ assistant: { ...me.assistant!, publicReceipts: rs } as any }); }} />
                  <input className="w-20 rounded-lg border p-2" type="number" min={0} value={r.coSigners ?? 0} title="Co-signers"
                    onChange={e => { const rs = [...(me.assistant?.publicReceipts ?? [])]; rs[i] = { ...r, coSigners: Number(e.target.value) };
                      save({ assistant: { ...me.assistant!, publicReceipts: rs } as any }); }} />
                  <button className="text-xs text-red-500" onClick={() => { const rs = [...(me.assistant?.publicReceipts ?? [])]; rs.splice(i, 1);
                    save({ assistant: { ...me.assistant!, publicReceipts: rs } as any }); }}>✕</button>
                </div>
              ))}
            </div>
          </>}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-neutral-500">Intake data · {me.pendingIntakes ?? 0} awaiting you</span>
            <button className="rounded-lg border px-3 py-1.5 text-xs text-red-600" onClick={async () => {
              if (!confirm("Delete ALL intake conversations and visitor data? This cannot be undone.")) return;
              await fetch("/api/intake/purge", { method: "POST" });
              location.reload();
            }}>Delete all intake data</button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500">Scheduling preferences</h2>
        <div className="mt-3 space-y-3 rounded-xl border bg-white p-5">
          {([["Working hours", "workingHours", ["Weekdays · 8:00 AM – 4:00 PM", "Weekdays · 9:00 AM – 5:00 PM", "Weekdays · 10:00 AM – 6:00 PM"]],
             ["Meeting distribution", "distribution", ["Consolidate onto busier days", "Spread evenly", "Protect mornings"]],
             ["Recurring rules", "recurring", ["None", "Daily standups", "Weekly review Friday"]]] as const).map(([label, key, opts]) =>
            <label key={key} className="flex items-center justify-between text-sm">
              {label}
              <select className="rounded-lg border p-2" value={sched[key] ?? opts[1]}
                onChange={e => save({ scheduling: { ...sched, [key]: e.target.value } })}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>)}
        </div>
      </section>
    </div>
  );
}
