import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IntakeForm from "./intake-form";

export const dynamic = "force-dynamic";

const AVATAR_TINTS: Record<string, string> = {
  column: "bg-stone-200", sprout: "bg-emerald-100", beacon: "bg-amber-100",
  drift: "bg-sky-100", ledger: "bg-violet-100", moss: "bg-lime-100",
  quill: "bg-rose-100", vesta: "bg-orange-100",
};

async function getPublicAssistant(publicSlug: string) {
  const assistant = await prisma.assistant.findFirst({
    where: { publicSlug, isPublic: true },
    include: { user: { select: { name: true } } },
  });
  return assistant; // null → notFound (no existence hints for private/missing slugs)
}

export async function generateMetadata({ params }: { params: { publicSlug: string } }): Promise<Metadata> {
  const a = await getPublicAssistant(params.publicSlug);
  if (!a) return { title: "Not found" };
  return {
    title: `${a.name} — agent for ${a.user.name ?? "a professional"}`,
    description: a.tagline ?? a.personality,
    openGraph: { title: `${a.name}`, description: a.tagline ?? a.personality, type: "profile" },
  };
}

export default async function PublicAgentPage({ params }: { params: { publicSlug: string } }) {
  const a = await getPublicAssistant(params.publicSlug);
  if (!a) notFound();

  const receipts = (a.publicReceipts as { title: string; detail?: string; coSigners?: number }[] | null) ?? [];
  const ownerName = a.user.name ?? "the owner";

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      {/* Identity */}
      <div className="flex items-start gap-5">
        <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-4xl font-semibold text-neutral-700 ${AVATAR_TINTS[a.avatar] ?? "bg-neutral-100"}`}>
          {a.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{a.name}</h1>
          <p className="text-sm" style={{ color: "var(--ink-2)" }}>Agent for {ownerName}</p>
          {a.capacity
            ? <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open to new work</span>
            : <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> Not taking new work</span>}
        </div>
      </div>

      {a.tagline && <p className="mt-6 text-lg" style={{ color: "var(--ink)" }}>&ldquo;{a.tagline}&rdquo;</p>}

      {/* Right now */}
      {(a.capacity || a.openTo.length > 0 || a.notOpenTo.length > 0) && (
        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>Right now</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {a.capacity && <div className="flex gap-3"><dt className="w-20 shrink-0" style={{ color: "var(--ink-3)" }}>Capacity</dt><dd>{a.capacity}</dd></div>}
            {a.openTo.length > 0 && <div className="flex gap-3"><dt className="w-20 shrink-0" style={{ color: "var(--ink-3)" }}>Open to</dt><dd>{a.openTo.join(" · ")}</dd></div>}
            {a.notOpenTo.length > 0 && <div className="flex gap-3"><dt className="w-20 shrink-0" style={{ color: "var(--ink-3)" }}>Not</dt><dd style={{ color: "var(--ink-2)" }}>{a.notOpenTo.join(" · ")}</dd></div>}
          </dl>
        </section>
      )}

      {/* Work receipts */}
      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>Work receipts</h2>
        {receipts.length === 0
          ? <p className="mt-3 text-sm" style={{ color: "var(--ink-2)" }}>No work receipts yet — {a.name} is new.</p>
          : <ul className="mt-3 space-y-3">
              {receipts.map((r, i) => (
                <li key={i} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">✓ {r.title}</span>
                    {r.coSigners
                      ? <span className="chip chip-verified shrink-0">confirmed by {r.coSigners}</span>
                      : <span className="chip shrink-0">self-declared</span>}
                  </div>
                  {r.detail && <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>{r.detail}</p>}
                </li>
              ))}
            </ul>}
      </section>

      {/* Intake */}
      <section className="card mt-12" style={{ padding: 24 }}>
        <h2 className="text-base font-semibold">Work with {ownerName.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-neutral-500">{a.name} replies here within a day. {ownerName.split(" ")[0]} only sees it if it&rsquo;s a fit.</p>
        <IntakeForm publicSlug={a.publicSlug!} />
      </section>

      {/* Footer CTA — every public page is an ad for the platform */}
      <footer className="mt-14 border-t pt-6 text-center">
        <p className="text-sm text-neutral-500">{ownerName}&rsquo;s agent has a page like this.</p>
        <a href="/login" className="mt-2 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4">Get one for your agent →</a>
      </footer>
    </main>
  );
}
