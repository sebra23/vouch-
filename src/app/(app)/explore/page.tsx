"use client";
import Link from "next/link";
import { useState } from "react";

const LIVE = new Set(["auto-inbox", "morning-briefing", "meeting-briefing", "loose-ends"]);
const CATEGORIES = ["All", "Manage Your Inbox", "Manage Your Calendar", "Prepare for Meetings", "Stay Informed", "Nurture Relationships", "Streamline Operations"];

type Card = { key: string; title: string; desc: string; cat: string };
const CARDS: Card[] = [
  { key: "auto-inbox", title: "Auto-inbox", desc: "Watches for new emails, labels by type, drafts replies when warranted, helps with scheduling.", cat: "Manage Your Inbox" },
  { key: "decline-cold-outreach", title: "Decline Cold Outreach", desc: "Detects unsolicited recruiter/sales outreach, labels it, drafts a polite decline.", cat: "Manage Your Inbox" },
  { key: "schedule-optimizer", title: "Schedule Optimizer", desc: "Every Sunday evening: cluster meetings, protect focus time, avoid burnout.", cat: "Manage Your Calendar" },
  { key: "morning-briefing", title: "Morning Briefing", desc: "Daily email: your schedule, urgent items, updates on topics you care about.", cat: "Stay Informed" },
  { key: "meeting-briefing", title: "Meeting Briefing", desc: "Researches upcoming meetings, emails a concise briefing, saves it as a document.", cat: "Prepare for Meetings" },
  { key: "loose-ends", title: "Loose-Ends Sweep", desc: "Late each weekday, sweeps mail and Slack for every open loop you owe.", cat: "Manage Your Inbox" },
  { key: "competitive-intel", title: "Competitive Intel Briefing", desc: "Scans the web for competitor news and product launches on your schedule.", cat: "Stay Informed" },
  { key: "newsletter-digest", title: "Newsletter Digest", desc: "Concise digest of your labeled newsletters, on your chosen schedule.", cat: "Stay Informed" },
  { key: "github-reports", title: "GitHub Reports", desc: "Aggregates development activity — built, merged, blocked — without hunting.", cat: "Streamline Operations" },
  { key: "relationship-reconnect", title: "Relationship Reconnect", desc: "Weekly catch-up suggestions for people you value but haven't contacted.", cat: "Nurture Relationships" },
  { key: "deal-spotter", title: "Deal Spotter", desc: "Scans inbound email for opportunities, logs signals, recommends next steps.", cat: "Streamline Operations" },
  { key: "weekly-briefing", title: "Weekly Briefing", desc: "Start your week knowing what's ahead.", cat: "Stay Informed" },
];

export default function ExplorePage() {
  const [cat, setCat] = useState("All");
  const shown = CARDS.filter(c => cat === "All" || c.cat === cat);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Explore</h1>
      <p className="mt-1 text-sm text-neutral-500">Pre-built routines from ari. Cards marked coming soon are on the roadmap.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)}
          className={"rounded-full border px-3 py-1.5 text-xs " + (cat === c ? "bg-neutral-900 text-white" : "bg-white text-neutral-600")}>
          {c}
        </button>)}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {shown.map(c => {
          const live = LIVE.has(c.key);
          return <div key={c.key} className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.title}</div>
              {!live && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">coming soon</span>}
            </div>
            <p className="mt-2 text-sm text-neutral-600">{c.desc}</p>
            {live
              ? <Link href="/powers/routines" className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-1.5 text-sm text-white">Set up</Link>
              : <button disabled className="mt-4 rounded-lg border px-4 py-1.5 text-sm text-neutral-400">Install</button>}
          </div>;
        })}
      </div>
    </div>
  );
}
