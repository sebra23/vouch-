"use client";
import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="rounded-lg bg-neutral-900 px-4 text-sm text-white"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); } catch {}
        setDone(true); setTimeout(() => setDone(false), 1500);
      }}>
      {done ? "Copied" : "Copy"}
    </button>
  );
}
