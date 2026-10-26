"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDoc() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  async function create() {
    await fetch("/api/docs", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || "Untitled", content }) });
    setOpen(false); setTitle(""); setContent("");
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">+ New</button>
      {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30" onClick={() => setOpen(false)}>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-semibold">New document</h2>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title…"
            className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm" />
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Write or paste a SKILL.md, notes, anything…"
            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm" />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button onClick={create} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">Save</button>
          </div>
        </div>
      </div>}
    </>
  );
}
