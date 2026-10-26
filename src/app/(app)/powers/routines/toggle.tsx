"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Toggle({ routineKey, initial }: { routineKey: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const router = useRouter();
  return <input type="checkbox" checked={on} className="h-5 w-9 accent-neutral-900" onChange={async e => {
    setOn(e.target.checked);
    await fetch("/api/routines/toggle", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: routineKey, enabled: e.target.checked }) });
    router.refresh();
  }} />;
}
