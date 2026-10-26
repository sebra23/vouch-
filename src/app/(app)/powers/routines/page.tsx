import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Toggle from "./toggle";

export const dynamic = "force-dynamic";

const CATALOG = [
  ["auto-inbox", "Auto-inbox", "Watches new email, labels it, drafts replies when warranted, helps with scheduling."],
  ["morning-briefing", "Morning Briefing", "A daily email with your schedule, urgent items, and updates you care about."],
  ["meeting-briefing", "Meeting Briefing", "Researches upcoming meetings and emails you a concise briefing."],
  ["loose-ends", "Loose-Ends Sweep", "Late each weekday, catches everything you owe before sign-off."],
] as const;

export default async function RoutinesPage() {
  const session = await getServerSession(authOptions);
  const rows = await prisma.routine.findMany({ where: { userId: (session as any).userId! } });
  const enabled = new Map(rows.map(r => [r.key, r.enabled]));
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Routines</h1>
      <p className="mt-1 text-sm text-neutral-500">Automate repeatable work on a schedule or when something changes.</p>
      <div className="mt-6 space-y-3">
        {CATALOG.map(([key, title, desc]) => <div key={key} className="flex items-center justify-between rounded-xl border bg-white p-4">
          <div><div className="font-medium">{title}</div><div className="text-sm text-neutral-600">{desc}</div></div>
          <Toggle routineKey={key} initial={enabled.get(key) ?? false} />
        </div>)}
      </div>
    </div>
  );
}