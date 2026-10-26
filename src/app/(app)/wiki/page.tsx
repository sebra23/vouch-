import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

const SECTION_ORDER = ["Overview", "Recent updates", "Projects", "Profile", "People", "Notes"];

export default async function WikiPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const [pages, logs, user] = await Promise.all([
    prisma.wikiPage.findMany({ where: { userId } }),
    prisma.appLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, plan: true } }),
  ]);

  const byTitle = new Map(pages.map(p => [p.title, p]));
  const nav = [...SECTION_ORDER.filter(t => t !== "Recent updates" && byTitle.has(t)),
               ...pages.filter(p => !SECTION_ORDER.includes(p.title)).map(p => p.title)];

  return (
    <div className="flex h-full">
      <aside className="w-48 shrink-0 border-r bg-white p-4">
        <div className="mb-3 text-sm font-medium">Wiki</div>
        {nav.map(t => <a key={t} href={`#${t.replace(/\s+/g, "-").toLowerCase()}`}
          className="block rounded-lg px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">{t}</a>)}
      </aside>

      <div className="flex-1 space-y-6 overflow-y-auto p-8">
        <section id="overview" className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-neutral-900 text-xl font-semibold text-white">
              {(user?.name ?? "A")[0].toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold">{user?.name ?? "You"}</div>
              <div className="text-sm text-neutral-500">{user?.email}</div>
              <div className="text-sm capitalize text-neutral-500">{user?.plan} plan</div>
            </div>
          </div>
          {byTitle.get("Overview") && <p className="mt-4 text-sm text-neutral-600">{byTitle.get("Overview")!.content}</p>}
        </section>

        <section id="recent-updates">
          <h2 className="text-sm font-medium text-neutral-500">Recent updates</h2>
          <div className="mt-2 rounded-xl border bg-white p-5">
            {logs.length === 0 && <p className="text-sm text-neutral-400">Your assistant will log updates here as it works.</p>}
            <ul className="space-y-2 text-sm text-neutral-700">
              {logs.map(l => <li key={l.id}>· {l.createdAt.toLocaleDateString()} — {l.message}</li>)}
            </ul>
          </div>
        </section>

        {nav.filter(t => t !== "Overview").map(t => byTitle.get(t)).filter(Boolean).map(p => (
          <section key={p!.id} id={p!.title.replace(/\s+/g, "-").toLowerCase()}>
            <h2 className="text-sm font-medium text-neutral-500">{p!.title}</h2>
            <div className="mt-2 rounded-xl border bg-white p-5">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{p!.content}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
