"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntakeCard({ threadId, peerName, peerEmail }: { threadId: string; peerName: string; peerEmail: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  async function decide(decision: "approve" | "decline" | "keep") {
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/intake/decide", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, decision }),
    });
    setBusy(false);
    if (r.ok) {
      setDone(decision);
      router.refresh();
    }
  }

  if (done) return (
    <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
      {done === "approve" && `Approved — an intro email to ${peerName} is on its way.`}
      {done === "decline" && `Declined — ${peerName} can see a polite closure on their link. No email sent.`}
      {done === "keep" && `The agent will dig deeper with ${peerName}.`}
    </div>
  );

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">New request via your public page</span>
          <p className="mt-1.5 text-sm font-medium">{peerName} <span className="font-normal text-neutral-500">&lt;{peerEmail}&gt;</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => decide("approve")} disabled={busy}
            className="rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50">Approve intro</button>
          <button onClick={() => decide("keep")} disabled={busy}
            className="rounded-lg border bg-white px-3.5 py-2 text-sm disabled:opacity-50">Keep talking</button>
          <button onClick={() => decide("decline")} disabled={busy}
            className="rounded-lg border bg-white px-3.5 py-2 text-sm text-neutral-500 disabled:opacity-50">Decline</button>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-500">Approve sends one intro email to {peerName}. Decline never emails them — they see a closure on their view link. Nothing is sent without this decision.</p>
    </div>
  );
}
