"use client";
import { useState } from "react";

const LIVE = ["Google", "Microsoft 365"];
const POPULAR = ["Google", "Microsoft 365", "Slack", "GitHub", "Notion", "HubSpot", "Calendly", "Linear", "Asana", "Zoom", "Salesforce", "Gong", "Intercom"];
const ALL: [string, string][] = [
  ["Google", "Gmail, Calendar, Drive, Docs, Sheets"], ["Microsoft 365", "Outlook, Calendar, OneDrive, Teams"],
  ["Slack", "Persona + bot — chat with your assistant"], ["GitHub", "Repos, issues, pull requests"],
  ["GitLab", "Repos, MRs, issues"], ["Notion", "Pages and databases"], ["HubSpot", "CRM contacts and deals"],
  ["Calendly", "Availability and bookings"], ["Linear", "Issues and sprints"], ["Asana", "Tasks and projects"],
  ["Dropbox", "Read and share files"], ["Zoom", "Meetings and recordings"], ["Salesforce", "Records and activity"],
  ["Airtable", "Read and write records"], ["Affinity", "Search companies, people, opportunities"],
  ["Ashby", "Candidates and jobs"], ["Attio", "Search and update CRM"], ["Box", "Search, read, organize files"],
  ["Brex", "Transactions and users"], ["Cal.com", "Availability and bookings"], ["Canva", "Create and edit designs"],
  ["Clay", "Find leads, enrich data"], ["ClickUp", "Search and manage tasks"], ["Coda", "Read and update docs"],
  ["Copper CRM", "Inspect and update CRM"], ["Cursor", "Manage cloud agents"], ["Fathom", "Meeting notes"],
  ["Fireflies", "Meeting intelligence"], ["Front", "Shared inbox conversations"], ["Gong", "Calls and transcripts"],
  ["Google Analytics", "Sessions, page views, conversions"], ["Granola", "Search meeting notes"],
  ["Hex", "Run analyses, search projects"], ["Intercom", "Support conversations and articles"],
  ["Jira", "Track issues and sprints"], ["Outlook", "Mail and calendar (via Microsoft 365)"],
  ["QuickBooks", "Accounting data"], ["Ramp", "Spend management"], ["Sentry", "Error tracking"],
  ["Stripe", "Payments and subscriptions"], ["Supabase", "Database projects"], ["Text Messaging", "SMS via your assistant"],
  ["WhatsApp", "Message your assistant"], ["Telegram", "Message your assistant"], ["iOS", "iPhone app"],
  ["Mac Desktop", "Beta — iMessages, contacts, voice"], ["LinkedIn", "Profile and network context (beta)"],
  ["Gmail Send", "Outbound mail from your assistant"], ["Web Search", "Research on demand"],
];

export default function IntegrationsPage() {
  const [tab, setTab] = useState<"All" | "Popular" | "Connected">("All");
  const [q, setQ] = useState("");
  const shown = ALL.filter(([n, d]) => (tab === "All" || (tab === "Popular" && POPULAR.includes(n)) ||
    (tab === "Connected" && LIVE.includes(n))) && (n + d).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Integrations</h1>
      <p className="mt-1 text-sm text-neutral-500">Connect the tools where your work already happens.</p>

      <div className="mt-5 flex items-center gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search integrations…"
          className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm" />
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {(["All", "Popular", "Connected"] as const).map(t => <button key={t} onClick={() => setTab(t)}
            className={"rounded-lg px-3 py-1.5 text-sm " + (tab === t ? "bg-white font-medium shadow-sm" : "text-neutral-500")}>
            {t} {t === "All" ? ALL.length : t === "Popular" ? 13 : 2}
          </button>)}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        {shown.map(([name, desc]) => {
          const live = LIVE.includes(name);
          return <div key={name} className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="font-medium">{name}</div>
              {live
                ? <button className="rounded-lg bg-neutral-900 px-3 py-1 text-xs text-white">Connect</button>
                : <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">coming soon</span>}
            </div>
            <p className="mt-1 text-sm text-neutral-600">{desc}</p>
          </div>;
        })}
      </div>
    </div>
  );
}
