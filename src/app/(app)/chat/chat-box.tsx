"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatBox({ threadId, initial }: { threadId: string | null; initial: { role: string; content: string }[] }) {
  const [msgs, setMsgs] = useState(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    const text = input; setInput("");
    setMsgs(m => [...m, { role: "user", content: text }]);
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, threadId }) });
    const j = await r.json();
    setMsgs(m => [...m, { role: "assistant", content: j.reply }]);
    if (!threadId && j.threadId) router.replace(`/chat/${j.threadId}`);
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-1 flex-col p-6">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {msgs.map((m, i) => <div key={i} className={m.role === "user" ? "text-right" : ""}>
          <div className={"inline-block max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm " +
            (m.role === "user" ? "bg-neutral-900 text-white" : "bg-white border")}>{m.content}</div>
        </div>)}
        {busy && <div className="text-sm text-neutral-400">Working…</div>}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Hand off a task…" className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2" />
        <button onClick={send} disabled={busy} className="rounded-xl bg-neutral-900 px-5 text-sm text-white">Send</button>
      </div>
    </div>
  );
}
