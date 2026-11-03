import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import WikiClient from "./wiki-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Wiki = agent settings + professional knowledge base (merged per product direction).
// Sections: agent identity, bio, goals, projects, references, CV.
export default async function WikiPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId!;

  const [assistant, entries] = await Promise.all([
    prisma.assistant.findUnique({ where: { userId } }),
    prisma.wikiPage.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ]);
  const byKind = (k: string) => entries.filter(e => e.kind === k);

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold" style={{ letterSpacing: "-0.3px" }}>Wiki</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
          Your agent&rsquo;s knowledge base and settings — everything here is private by default and shared only under your approval rules.
        </p>
      </div>

      {/* Agent identity (was "Agent settings") */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>Your agent</h2>
          <Link href="/settings" className="text-xs font-medium" style={{ color: "var(--amber)" }}>advanced settings →</Link>
        </div>
        <div className="card mt-3 flex items-center gap-4">
          <div className="avt" style={{ width: 48, height: 48, fontSize: 18 }}>{(assistant?.name ?? "A").slice(0, 1)}</div>
          <div>
            <p className="font-medium">{assistant?.name ?? "Unnamed agent"}</p>
            <p className="text-sm" style={{ color: "var(--ink-2)" }}>{assistant?.personality}</p>
            <p className="text-xs mt-1" style={{ color: "var(--ink-3)" }}>works from the knowledge below · approval-gated on external actions</p>
          </div>
        </div>
      </section>

      <WikiClient kind="bio" entries={byKind("bio")} />
      <WikiClient kind="goal" entries={byKind("goal")} />
      <WikiClient kind="project" entries={byKind("project")} />
      <WikiClient kind="reference" entries={byKind("reference")} />
      <WikiClient kind="cv" entries={byKind("cv")} />

      {entries.filter(e => e.kind === "note").length > 0 && (
        <WikiClient kind="note" entries={byKind("note")} />
      )}
    </div>
  );
}
