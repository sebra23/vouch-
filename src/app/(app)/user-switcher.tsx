"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Persona = { email: string; name: string; role: string; tile: string };

export default function UserSwitcher({ personas, current }: { personas: Persona[]; current: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function switchTo(email: string) {
    setOpen(false);
    const r = await fetch("/api/demo-login", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }) });
    if (r.ok) { router.refresh(); location.href = "/today"; }
  }

  const active = personas.find(p => p.email === current);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-v"
        style={{ border: "1px solid var(--line)", background: "var(--canvas)" }}
        title="Switch demo user">
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: active?.tile ?? "var(--pearl)", color: "#111" }}>
          {(active?.name ?? "?").slice(0, 1)}
        </span>
        <span className="hidden text-xs font-medium sm:inline" style={{ color: "var(--ink)" }}>
          {active?.name ?? "User"}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="var(--ash)" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl p-1.5"
          style={{ background: "var(--canvas)", border: "1px solid var(--line)", boxShadow: "var(--shadow-xl)" }}>
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--ash)" }}>
            View as · demo personas
          </p>
          {personas.map(p => (
            <button key={p.email} onClick={() => switchTo(p.email)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-v"
              style={{ background: p.email === current ? "var(--cream-wash)" : "transparent" }}
              onMouseOver={e => { if (p.email !== current) e.currentTarget.style.background = "var(--cream-wash)"; }}
              onMouseOut={e => { if (p.email !== current) e.currentTarget.style.background = ""; }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: p.tile, color: "#111" }}>{p.name.slice(0, 1)}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="block text-xs" style={{ color: "var(--ash)" }}>{p.role}</span>
              </span>
              {p.email === current && <span className="ml-auto text-xs" style={{ color: "var(--success)" }}>●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
