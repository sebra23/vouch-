"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const KIND_META: Record<string, { label: string; placeholder: string; titlePh: string; multi: boolean }> = {
  bio:      { label: "Bio",           placeholder: "Who you are, in your own words — what you do, how you work, what you're known for.", titlePh: "Short headline", multi: false },
  goal:     { label: "Goals",         placeholder: "What you want next — roles, industries, rate band, timeline. Your agent optimizes for these.", titlePh: "Goal", multi: true },
  project:  { label: "Projects",      placeholder: "What you built, the measurable outcome, who can confirm it.", titlePh: "Project", multi: true },
  reference:{ label: "References",    placeholder: "People who can vouch for specific work. Include what they can confirm.", titlePh: "Reference", multi: true },
  cv:       { label: "CV",            placeholder: "Paste your CV text — or upload a .txt/.md file.", titlePh: "CV version label", multi: true },
};

export default function WikiClient({ kind, entries, isAdmin }: { kind: string; entries: { id: string; title: string; content: string; provenance: string }[]; isAdmin?: boolean }) {
  const meta = KIND_META[kind];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!meta) return null;

  async function save() {
    if (busy || !title.trim() || !content.trim()) return;
    setBusy(true);
    const r = await fetch("/api/wiki", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, title, content }) });
    setBusy(false);
    if (r.ok) { setTitle(""); setContent(""); setOpen(false); router.refresh(); }
  }

  async function remove(id: string) {
    await fetch(`/api/wiki?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200_000) { alert("File too large — paste the text instead (200KB max)."); return; }
    const reader = new FileReader();
    reader.onload = () => { setContent(String(reader.result ?? "")); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); };
    reader.readAsText(f);
  }

  const input: React.CSSProperties = { border: "1px solid var(--line)", borderRadius: 10, background: "#fff", color: "var(--ink)", fontSize: 14, padding: "10px 12px", width: "100%" };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>{meta.label} · {entries.length}</h2>
        <button onClick={() => setOpen(!open)} className="text-xs font-medium" style={{ color: "var(--amber)" }}>
          {open ? "cancel" : `+ add ${meta.label.toLowerCase().slice(0, -1) || meta.label.toLowerCase()}`}
        </button>
      </div>

      {entries.length > 0 && <div className="mt-3 space-y-2">
        {entries.map(en => (
          <div key={en.id} className="card" style={{ padding: "12px 14px" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{en.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="chip" style={en.provenance === "verified" ? { background: "var(--success-soft)", color: "var(--success)" } : {}}>
                  {en.provenance === "imported" ? "imported" : en.provenance}
                </span>
                <button onClick={() => remove(en.id)} className="text-xs" style={{ color: "var(--ink-3)" }}>✕</button>
              </div>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap" style={{ color: "var(--ink-2)" }}>{en.content.slice(0, 400)}{en.content.length > 400 ? "…" : ""}</p>
          </div>
        ))}
      </div>}

      {open && <div className="card mt-3 space-y-2.5">
        <input style={input} placeholder={meta.titlePh} value={title} onChange={e => setTitle(e.target.value)} />
        {kind === "cv" && <>
          <input ref={fileRef} type="file" accept=".txt,.md,.markdown" className="hidden" onChange={onFile} />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ height: 36, fontSize: 13 }}>
            upload file (.txt / .md)
          </button>
        </>}
        <textarea style={{ ...input, minHeight: 110, resize: "vertical" }} placeholder={meta.placeholder}
          value={content} onChange={e => setContent(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={save} disabled={busy} className="btn-primary" style={{ height: 38, fontSize: 13 }}>{busy ? "Saving…" : "Save"}</button>
          <button onClick={() => setOpen(false)} className="btn-ghost" style={{ height: 38, fontSize: 13 }}>Cancel</button>
        </div>
        <p className="text-xs" style={{ color: "var(--ink-3)" }}>Marked self-declared until confirmed by another party. Your agent uses this to represent you — it never shares it without your approval settings.</p>
      </div>}

      {entries.length === 0 && !open && <p className="mt-2 text-sm" style={{ color: "var(--ink-3)" }}>Nothing here yet — {meta.multi ? "add as many as you like." : "one honest paragraph is enough."}</p>}
    </section>
  );
}
