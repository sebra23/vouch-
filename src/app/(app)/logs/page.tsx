import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

const SOURCE_STYLES: Record<string, string> = {
  routine: "bg-blue-100 text-blue-700", chat: "bg-neutral-100 text-neutral-700",
  inbound: "bg-purple-100 text-purple-700", system: "bg-green-100 text-green-700",
};

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const [logs, routines] = await Promise.all([
    prisma.appLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.routine.findMany({ where: { userId } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Logs</h1>
      <p className="mt-1 text-sm text-neutral-500">Everything your assistant did, most recent first.</p>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">Routines</h2>
      <div className="mt-2 space-y-2">
        {routines.length === 0 && <p className="text-sm text-neutral-400">No routines enabled yet.</p>}
        {routines.map(r => <div key={r.id} className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
          <span className="capitalize">{r.key.replace(/-/g, " ")}</span>
          <span className="text-neutral-500">{r.enabled ? (r.lastRunAt ? `Last run ${r.lastRunAt.toLocaleString()}` : "Enabled — scheduled") : "Off"}</span>
        </div>)}
      </div>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">Activity</h2>
      <div className="mt-2 space-y-2">
        {logs.length === 0 && <p className="text-sm text-neutral-400">No activity yet — logs appear as your assistant works.</p>}
        {logs.map(l => <div key={l.id} className="flex items-start gap-3 rounded-xl border bg-white p-4 text-sm">
          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${SOURCE_STYLES[l.source] ?? "bg-neutral-100"}`}>{l.source}</span>
          <span className="flex-1 text-neutral-700">{l.message}</span>
          <span className="whitespace-nowrap text-xs text-neutral-400">{l.createdAt.toLocaleString()}</span>
        </div>)}
      </div>
    </div>
  );
}
