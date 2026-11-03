"use client";
import { useState } from "react";
import Link from "next/link";

export type NavEntry = { group: string; label: string; href: string };

export function MobileNav({ entries, brand }: { entries: NavEntry[]; brand: string }) {
  const [open, setOpen] = useState(false);
  const groups = [...new Set(entries.map(e => e.group))];

  return (
    <>
      {/* top bar (mobile only) */}
      <div className="flex items-center justify-between border-b px-4 py-3 md:hidden"
        style={{ borderColor: "var(--line)", background: "var(--canvas)" }}>
        <Link href="/today" className="text-lg font-medium" style={{ letterSpacing: "-0.02em" }}>{brand}</Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu"
          className="rounded-lg p-2" style={{ border: "1px solid var(--line)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0" style={{ background: "rgba(17,17,17,0.4)" }} onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto p-4"
            style={{ background: "var(--canvas)", borderLeft: "1px solid var(--line)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-medium" style={{ letterSpacing: "-0.02em" }}>{brand}</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2"
                style={{ border: "1px solid var(--line)" }}>✕</button>
            </div>
            {groups.map(g => (
              <div key={g} className="mt-4 first:mt-0">
                <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ash)" }}>{g}</p>
                {entries.filter(e => e.group === g).map(e => (
                  <Link key={e.href} href={e.href} onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm transition-v"
                    style={{ color: "var(--ink)" }}
                    onMouseOver={ev => (ev.currentTarget.style.background = "var(--cream-wash)")}
                    onMouseOut={ev => (ev.currentTarget.style.background = "")}>
                    {e.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
