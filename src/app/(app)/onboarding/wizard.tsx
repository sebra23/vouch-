"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTINES } from "./routines-data";

const STEPS = ["Welcome", "Routines", "Your profile", "Apps", "Scheduling", "Assistant", "Public page", "Channels"];

const INTEGRATIONS = [
  ["Dropbox", "Files"], ["GitHub", "Repos, issues, pull requests"], ["Notion", "Pages and databases"],
  ["Supabase", "Database projects"], ["Slack Persona", "Assistant in Slack"], ["macOS", "Desktop app"],
  ["HubSpot", "CRM contacts and deals"], ["Calendly", "Availability and bookings"], ["Linear", "Issues and sprints"],
] as const;

const AVATARS = ["column", "sprout", "beacon", "drift", "ledger", "moss", "quill", "vesta"]; // original icon set, own art

export default function Wizard({ email, name, provider }: { email: string; name: string; provider: string }) {
  const [step, setStep] = useState(0);
  const [routines, setRoutines] = useState<Record<string, boolean>>({});
  const [autoInboxOpts, setAutoInboxOpts] = useState({ label: true, archive: false, draft: true, scheduling: true });
  const [assistant, setAssistant] = useState({ name: "", personality: "Minimal, high-signal, and brief.", avatar: "column", voice: "Sage" });
  const [pub, setPub] = useState({ enabled: false, tagline: "", openTo: "" });
  const [sched, setSched] = useState({ workingHours: "Weekdays · 9:00 AM – 5:00 PM", distribution: "Consolidate onto busier days", recurring: "None" });
  const [q, setQ] = useState("");
  const router = useRouter();
  const slug = (assistant.name || "assistant").toLowerCase().replace(/\s+/g, "");

  async function finish() {
    await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routines, assistant, preferences: { scheduling: sched },
      publicProfile: pub.enabled ? { isPublic: true, tagline: pub.tagline || null,
        openTo: pub.openTo.split(",").map((s: string) => s.trim()).filter(Boolean) } : { isPublic: false } }) });
    router.push("/chat");
  }

  const filtered = INTEGRATIONS.filter(([n, d]) => (n + d).toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex gap-1">{STEPS.map((s, i) => <div key={s} className={"h-1 flex-1 rounded " + (i <= step ? "bg-neutral-800" : "bg-neutral-200")} />)}</div>
      <h1 className="text-2xl font-semibold">{STEPS[step]}</h1>

      {step === 0 && <>
        <ul className="mt-6 space-y-3 text-neutral-700">
          <li>Learn the basics from your email and calendar</li>
          <li>Choose the routines you want running in the background</li>
          <li>Connect extra apps and personalize your assistant</li>
          <li>It <u>never</u> sends emails or messages without your approval</li>
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl bg-neutral-100 p-4 text-sm">
          <label>Time zone
            <select className="mt-1 w-full rounded-lg border bg-white p-2">
              {["Europe/Zurich", "Europe/Stockholm", "Europe/Berlin", "America/New_York"].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Theme
            <select className="mt-1 w-full rounded-lg border bg-white p-2">
              <option>System</option><option>Light</option><option>Dark</option>
            </select>
          </label>
        </div>
      </>}

      {step === 1 && <div className="mt-6 space-y-4">
        {ROUTINES.map(r => <label key={r.key} className="flex items-center justify-between rounded-xl border bg-white p-4">
          <span><b>{r.title}</b><br /><span className="text-sm text-neutral-600">{r.desc}</span></span>
          <input type="checkbox" className="h-5 w-9 accent-neutral-900" checked={!!routines[r.key]}
            onChange={e => setRoutines({ ...routines, [r.key]: e.target.checked })} />
        </label>)}
      </div>}

      {step === 2 && <>
        <p className="mt-2 text-sm text-neutral-500">Review what your assistant learned. You can edit all of this later.</p>
        <div className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="font-semibold">{name || "You"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <section><h3 className="text-xs font-medium uppercase text-neutral-400">About you</h3>
              <p className="mt-1 text-sm text-neutral-700">Primary email {email}. Works across email and calendar. Assistant drafts in your language and keeps replies short.</p></section>
            <section><h3 className="text-xs font-medium uppercase text-neutral-400">Key contacts (sample)</h3>
              <div className="mt-2 grid gap-2 text-sm">
                {["Family & household", "Bank & broker", "Close collaborators"].map(c =>
                  <div key={c} className="rounded-lg bg-neutral-50 p-2">{c}</div>)}
              </div></section>
            <section className="sm:col-span-2"><h3 className="text-xs font-medium uppercase text-neutral-400">Communication style</h3>
              <p className="mt-1 text-sm text-neutral-700">Match the recipient's language. Short, direct, businesslike; replies often a single line.</p></section>
          </div>
        </div>
      </>}

      {step === 3 && <>
        <p className="mt-2 text-sm text-neutral-500">Integrations help your assistant do more work. All optional.</p>
        <div className="mt-4 flex items-center justify-between rounded-xl border bg-white p-4">
          <div><div className="font-medium">{email}</div><div className="text-sm text-neutral-500">Primary account · {provider}</div></div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Connected</span>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search integrations…"
          className="mt-4 w-full rounded-lg border bg-white px-4 py-2.5 text-sm" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {filtered.map(([n, d]) => <div key={n} className="flex items-center justify-between rounded-xl border bg-white p-4">
            <div><div className="text-sm font-medium">{n}</div><div className="text-xs text-neutral-500">{d}</div></div>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">coming soon</span>
          </div>)}
        </div>
      </>}

      {step === 4 && <div className="mt-6 space-y-3">
        {([["Working hours", "workingHours", ["Weekdays · 8:00 AM – 4:00 PM", "Weekdays · 9:00 AM – 5:00 PM", "Weekdays · 10:00 AM – 6:00 PM"]],
           ["Meeting distribution", "distribution", ["Consolidate onto busier days", "Spread evenly", "Protect mornings"]],
           ["Recurring rules", "recurring", ["None", "Daily standups", "Weekly review Friday"]]] as const).map(([label, key, opts]) =>
          <label key={key} className="flex items-center justify-between rounded-xl border bg-white p-4">
            <span className="font-medium">{label}</span>
            <select className="rounded-lg border bg-white p-2 text-sm" value={sched[key as keyof typeof sched]}
              onChange={e => setSched({ ...sched, [key]: e.target.value })}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </label>)}
        <p className="text-xs text-neutral-400">Used when your assistant schedules for you. You can update these later in Settings.</p>
      </div>}

      {step === 5 && <div className="mt-6 space-y-4">
        {assistant.name && <div className="rounded-2xl border bg-white p-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-neutral-900 text-2xl font-semibold text-white">
            {assistant.name[0].toUpperCase()}
          </div>
          <div className="mt-3 text-2xl font-semibold">{assistant.name}</div>
          <div className="text-sm text-neutral-500">Created for {email} · {assistant.personality.split(",")[0]}</div>
        </div>}
        <div>
          <div className="mb-2 text-sm font-medium">Avatar</div>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map(a => <button key={a} onClick={() => setAssistant({ ...assistant, avatar: a })}
              className={"aspect-square rounded-xl border-2 " + (assistant.avatar === a ? "border-neutral-900 bg-neutral-100" : "border-neutral-200 bg-white")}
              title={a} aria-label={a} />)}
          </div>
        </div>
        <input className="w-full rounded-lg border bg-white p-3" placeholder="Name your assistant…"
          value={assistant.name} onChange={e => setAssistant({ ...assistant, name: e.target.value })} />
        <textarea className="w-full rounded-lg border bg-white p-3" rows={2}
          value={assistant.personality} onChange={e => setAssistant({ ...assistant, personality: e.target.value })} />
        <label className="block text-sm">Voice
          <select className="mt-1 w-full rounded-lg border bg-white p-2.5"
            value={assistant.voice} onChange={e => setAssistant({ ...assistant, voice: e.target.value })}>
            {["Sage", "Onyx", "Aria", "Pine"].map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <p className="text-sm text-neutral-500">{slug}@ari.app — only you can trigger your assistant by emailing this address.</p>
      </div>}

      {step === 6 && <div className="mt-6 space-y-4">
        <label className="flex items-start justify-between gap-4 rounded-xl border bg-white p-4">
          <span><span className="font-medium">Give {assistant.name || "your assistant"} a public page</span>
            <span className="mt-0.5 block text-sm text-neutral-500">A live page where anyone can pitch work to your agent. Your agent talks first — you only see a decision when it&rsquo;s worth your time. Off by default.</span></span>
          <input type="checkbox" className="mt-1 h-4 w-4" checked={pub.enabled} onChange={e => setPub({ ...pub, enabled: e.target.checked })} />
        </label>
        {pub.enabled && <>
          <input className="w-full rounded-lg border bg-white p-3" placeholder="Tagline — one line, in your agent's voice"
            value={pub.tagline} onChange={e => setPub({ ...pub, tagline: e.target.value })} />
          <input className="w-full rounded-lg border bg-white p-3" placeholder="Open to — e.g. fractional-cto, advisory"
            value={pub.openTo} onChange={e => setPub({ ...pub, openTo: e.target.value })} />
          <p className="text-xs text-neutral-400">You can edit or turn this off anytime in Settings. Your page only shows what you put on it.</p>
        </>}
        {!pub.enabled && <p className="text-sm text-neutral-500">Skip for now — enable it later in Settings whenever you&rsquo;re ready.</p>}
      </div>}

      {step === 7 && <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-xl border bg-white p-4">
          <div><div className="font-medium">Send your assistant an email</div>
            <div className="text-sm text-neutral-500">{slug}@ari.app</div></div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Connected</span>
        </div>
        {[["Slack Bot", "Chat with your assistant from Slack"], ["Text Messaging", "Add it to group texts"],
          ["WhatsApp", "Message your assistant"], ["Telegram", "Message your assistant"],
          ["iOS", "Install the iPhone app"], ["Mac Desktop App", "Beta — iMessages, contacts, voice"]].map(([n, d]) =>
          <div key={n} className="flex items-center justify-between rounded-xl border bg-white p-4 opacity-70">
            <div><div className="font-medium">{n}</div><div className="text-sm text-neutral-500">{d}</div></div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">coming soon</span>
          </div>)}
      </div>}

      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? <button onClick={() => setStep(step - 1)}>Back</button> : <span />}
        <div className="flex items-center gap-4">
          {step === 3 && <button className="text-sm text-neutral-500 underline" onClick={() => setStep(4)}>Skip for now</button>}
          {step < STEPS.length - 1
            ? <button className="rounded-lg bg-neutral-900 px-6 py-2.5 text-white" onClick={() => setStep(step + 1)}>Continue</button>
            : <button className="rounded-lg bg-neutral-900 px-6 py-2.5 text-white" onClick={finish}>Finish setup</button>}
        </div>
      </div>
    </main>
  );
}
