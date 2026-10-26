"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JobSwipe({ jobId }: { jobId: string }) {
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<string | null>(null);
  const router = useRouter();

  async function swipe(s: "interested" | "passed") {
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, state: s }) });
    setBusy(false);
    if (r.ok) { setState(s); router.refresh(); }
  }

  if (state === "interested") return <p className="mt-3 text-xs text-emerald-700">✓ you said you&rsquo;re interested — waiting for them</p>;
  if (state === "passed") return <p className="mt-3 text-xs text-neutral-400">passed — they&rsquo;ll never know</p>;

  return (
    <div className="mt-3 flex gap-2">
      <button onClick={() => swipe("interested")} disabled={busy}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">I&rsquo;m interested</button>
      <button onClick={() => swipe("passed")} disabled={busy}
        className="rounded-lg border px-4 py-2 text-sm text-neutral-500 disabled:opacity-50">Not for me</button>
    </div>
  );
}
