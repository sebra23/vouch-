"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Results = {
  threads: { id: string; title: string }[];
  wiki: { id: string; title: string }[];
  routines: { key: string; title: string }[];
  pages: { path: string; label: string }[];
};

const PAGES = [
  { path: "/chat", label: "Chat" }, { path: "/for-you", label: "For you" },
  { path: "/powers/routines", label: "Routines" }, { path: "/powers/skills", label: "Skills" },
  { path: "/powers/integrations", label: "Integrations" }, { path: "/explore", label: "Explore" },
  { path: "/wiki", label: "Wiki" }, { path: "/library", label: "Library" },
  { path: "/logs", label: "Logs" }, { path: "/settings", label: "Settings" },
  { path: "/pricing", label: "Pricing" }, { path: "/referrals", label: "Referrals" },
  { path: "/teams", label: "Teams" },
];

const TABS = ["All", "Threads", "Actions", "Pages", "People", "Content", "Routines", "Settings"] as const;

export default function Search() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [results, setResults] = useState<Results>({ threads: [], wiki: [], routines: [], pages: PAGES });
  const router = useRouter();
  const box = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (open) setTimeout(() => box.current?.focus(), 50); }, [open]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json());
      setResults({ ...r, pages: PAGES.filter(p => p.label.toLowerCase().includes(q.toLowerCase())) });
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="mt-2 flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-neutral-400">
      Search… <span className="text-xs">⌘K</span>
    </button>
  );

  const show = (group: keyof Results) => tab === "All" || (group === "threads" && tab === "Threads") ||
    (group === "pages" && (tab === "Pages" || tab === "Settings" || tab === "Actions")) ||
    (group === "wiki" && (tab === "Content" || tab === "People")) || (group === "routines" && tab === "Routines");

  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/30 pt-24" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <input ref={box} value={q} onChange={e => setQ(e.target.value)} placeholder="Find anything…"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2" />
        <div className="mt-3 flex flex-wrap gap-1">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)}
            className={"rounded-full px-2.5 py-1 text-xs " + (tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100")}>{t}</button>)}
        </div>
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto text-sm">
          {show("threads") && results.threads.map(t => <button key={t.id} onClick={() => go(`/chat/${t.id}`)}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100">💬 {t.title}</button>)}
          {show("routines") && results.routines.map(r => <button key={r.key} onClick={() => go("/powers/routines")}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100">⚡ {r.title}</button>)}
          {show("wiki") && results.wiki.map(w => <button key={w.id} onClick={() => go("/wiki")}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100">📖 {w.title}</button>)}
          {show("pages") && results.pages.map(p => <button key={p.path} onClick={() => go(p.path)}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100">↗ {p.label}</button>)}
          {!results.threads.length && !results.wiki.length && !results.routines.length && !results.pages.length &&
            <p className="px-3 py-4 text-neutral-400">No results.</p>}
        </div>
      </div>
    </div>
  );
}
