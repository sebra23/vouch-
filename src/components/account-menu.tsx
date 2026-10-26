"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AccountMenu({ email, plan, credits, trialPct }:
  { email: string; plan: string; credits: number; trialPct: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const items = [
    ["Notifications", "/settings"], ["People", "/settings"], ["Team", "/settings"],
    ["Integrations", "/powers/integrations"], ["Logs", "/logs"],
    ["Install Apps", "/settings"], ["Settings", "/settings"], ["Help", "/settings"],
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full rounded-xl bg-neutral-100 p-3 text-left text-xs hover:bg-neutral-200">
        <div className="font-medium">{email}</div>
        <div className="mt-1 capitalize text-neutral-600">{plan} plan</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-300">
          <div className="h-full rounded-full bg-neutral-800" style={{ width: `${trialPct}%` }} />
        </div>
        <div className="mt-1 text-neutral-600">Trial credit {trialPct}% left</div>
      </button>

      {open && <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-2xl border bg-white p-2 shadow-lg">
        <div className="border-b p-3">
          <div className="text-sm font-medium">{email}</div>
          <Link href="/pricing" className="mt-2 block rounded-lg bg-neutral-900 py-1.5 text-center text-xs text-white">Upgrade</Link>
        </div>
        {items.map(([label, href]) => <Link key={label} href={href}
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">{label}</Link>)}
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 block w-full rounded-lg border-t px-3 py-2 text-left text-sm text-red-600 hover:bg-neutral-100">Sign out</button>
      </div>}
    </div>
  );
}
