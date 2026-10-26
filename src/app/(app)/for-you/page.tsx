"use client";
import Link from "next/link";
import { useState } from "react";

const FILTERS = ["All", "Quick ones", "Routines"] as const;

const SUGGESTIONS = [
  { kind: "Quick ones", title: "Free up Gmail storage before your mailbox stops working",
    desc: "Google warned your storage is nearly full. Large attachments can be archived or removed." },
  { kind: "Quick ones", title: "Review which apps you connected",
    desc: "You signed in with Google recently. Check third-party access and revoke what's unused." },
  { kind: "Quick ones", title: "Decide what to do with expiring loyalty points",
    desc: "A points balance is about to expire. Extending, spending, or letting go each takes under 5 minutes." },
  { kind: "Routines", title: "Morning inbox triage that surfaces only mail needing your reply",
    desc: "Your inbox buries messages that matter. Enable the Auto-inbox routine to label, archive, and draft replies automatically." },
  { kind: "Routines", title: "Loose-Ends Sweep before sign-off",
    desc: "Catches everything you owe people — open loops in mail and chat — in one private list each weekday evening." },
  { kind: "Routines", title: "Meeting Briefing for tomorrow's calendar",
    desc: "Get a researched brief per meeting: attendees, recent context, open questions. Enable it once; it runs before every meeting day." },
];

export default function ForYouPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = SUGGESTIONS.filter(s => filter === "All" || s.kind === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">For you</h1>
          <p className="mt-1 text-sm text-neutral-500">Task and routine suggestions from your assistant.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          <input type="checkbox" className="accent-neutral-900" /> Show only new
        </label>
      </div>

      <div className="mt-5 flex gap-1 rounded-xl bg-neutral-100 p-1">
        {FILTERS.map(f => <button key={f} onClick={() => setFilter(f)}
          className={"flex-1 rounded-lg py-1.5 text-sm " + (filter === f ? "bg-white font-medium shadow-sm" : "text-neutral-500")}>
          {f}
        </button>)}
      </div>

      <div className="mt-6 space-y-3">
        {shown.map(s => <div key={s.title} className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="font-medium">{s.title}</div>
            {s.kind === "Routines"
              ? <Link href="/powers/routines" className="shrink-0 rounded-lg bg-neutral-900 px-4 py-1.5 text-sm text-white">Set up</Link>
              : <Link href="/chat" className="shrink-0 rounded-lg border px-4 py-1.5 text-sm">Start</Link>}
          </div>
          <p className="mt-1.5 text-sm text-neutral-600">{s.desc}</p>
        </div>)}
      </div>
      <p className="mt-4 text-xs text-neutral-400">
        Suggestions become personalized — based on your actual mail, calendar, and storage — once your Google account is connected.
      </p>
    </div>
  );
}
