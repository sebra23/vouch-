import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-xl font-semibold">Create a team</h1>
      <ul className="mt-6 space-y-3 text-sm text-neutral-700">
        <li>↗ Share routines and skills with your team</li>
        <li>✎ Collaborate on routines and keep them up-to-date</li>
        <li>💬 Delegate busy work to your assistants</li>
        <li>📈 Bill to a team plan with shared analytics</li>
      </ul>
      <div className="mt-6 rounded-xl border bg-white p-4 text-sm text-neutral-500">
        Example: <b className="text-neutral-800">{user?.name ?? "A teammate"}</b> shared the routine{" "}
        <i>Daily standup prep</i> — a daily recap of progress, priorities, and blockers before the 10am standup.
      </div>
      <button disabled className="mt-6 rounded-lg bg-neutral-900 px-6 py-2.5 text-white opacity-60">
        Create team — opens after beta
      </button>
      <p className="mt-3 text-xs text-neutral-400">
        Don&apos;t need a team? <span className="underline">Hide this tab for now</span> — it stays in your sidebar for later.
      </p>
    </div>
  );
}
