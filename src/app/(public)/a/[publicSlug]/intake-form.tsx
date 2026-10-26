"use client";
import { useState } from "react";

export default function IntakeForm({ publicSlug }: { publicSlug: string }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see this field
  const [busy, setBusy] = useState(false);
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !message.trim() || !name.trim() || !email.trim()) return;
    setBusy(true); setError(null);
    const r = await fetch("/api/intake", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicSlug, message: message.slice(0, 1000), name: name.slice(0, 120), email: email.slice(0, 200), website }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok && j.tokenUrl) setTokenUrl(j.tokenUrl);          // guest views replies via magic link; no email pre-approval
    else setError(j.error ?? "Something went wrong — try again.");
  }

  if (tokenUrl) return (
    <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
      <p className="font-medium">Received — the agent is looking at it now.</p>
      <p className="mt-1">Keep this link to read the conversation:</p>
      <a href={tokenUrl} className="mt-1 block break-all font-medium underline underline-offset-2">{tokenUrl}</a>
      <p className="mt-2 text-xs text-emerald-700">The link works for 7 days. You won&rsquo;t be emailed until the owner approves an introduction.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      {/* honeypot: visually hidden, tab-order skipped */}
      <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} maxLength={1000}
        placeholder="Describe what you need — scope, timing, budget if relevant…"
        className="w-full rounded-xl border bg-neutral-50 p-3 text-sm outline-none focus:border-neutral-400" />
      <div className="flex gap-3">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
          className="w-1/2 rounded-xl border bg-neutral-50 p-3 text-sm outline-none focus:border-neutral-400" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your email"
          className="w-1/2 rounded-xl border bg-neutral-50 p-3 text-sm outline-none focus:border-neutral-400" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Sending…" : "Send →"}
      </button>
      <p className="text-xs text-neutral-400">Your conversation starts with {name ? "the agent" : "the agent"}, not a form reply. The owner decides what happens next.</p>
    </form>
  );
}
