import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import NewDoc from "./new-doc";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;
  const docs = await prisma.doc.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Library</h1>
          <p className="mt-1 text-sm text-neutral-500">Content grouped by topic across your connected sources.</p>
        </div>
        <NewDoc />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="font-medium">🕘 Recent</div>
          <div className="mt-1 text-sm text-neutral-500">{docs.length} file{docs.length === 1 ? "" : "s"}</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="font-medium">🗂 Uncategorized</div>
          <div className="mt-1 text-sm text-neutral-500">{docs.length} item{docs.length === 1 ? "" : "s"}</div>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-medium text-neutral-500">Files</h2>
      <div className="mt-2 space-y-2">
        {docs.length === 0 && <p className="text-sm text-neutral-400">
          Nothing yet — briefings and reports will appear here, or create your first note with + New.</p>}
        {docs.map(d => <div key={d.id} className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium">{d.title}</div>
          {d.content && <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{d.content.slice(0, 200)}</p>}
          <div className="mt-1 text-xs text-neutral-400">{d.kind} · {d.createdAt.toLocaleDateString()}</div>
        </div>)}
      </div>
    </div>
  );
}
