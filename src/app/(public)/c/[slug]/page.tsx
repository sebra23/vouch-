import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCompany(slug: string) {
  return prisma.company.findFirst({ where: { slug }, include: { owner: { select: { name: true } } } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCompany(params.slug);
  if (!c) return { title: "Not found" };
  return { title: `${c.name} — on Vouch`, description: c.description ?? `${c.name} is hiring via agents.` };
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const c = await getCompany(params.slug);
  if (!c) notFound();

  const jobs = await prisma.job.findMany({ where: { status: "open" },
    include: { user: { select: { id: true } } }, orderBy: { id: "desc" } });
  // Jobs "at" this company: posted by the owner, or carrying the company name
  const companyJobs = jobs.filter(j => j.company === c.name || j.user.id === c.ownerId);
  const agents = await prisma.assistant.findMany({ where: { userId: c.ownerId }, select: { name: true, isPublic: true, publicSlug: true } });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-semibold"
          style={{ background: "var(--surface-muted)", color: "var(--ink)" }}>
          {c.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{c.name}</h1>
            {c.verified && <span className="chip chip-verified">verified</span>}
          </div>
          {c.description && <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>{c.description}</p>}
          <p className="mt-1 text-xs" style={{ color: "var(--ink-3)" }}>
            {[c.industry, c.size, c.location].filter(Boolean).join(" · ")}
            {c.website && <> · <a href={c.website} target="_blank" rel="noreferrer" style={{ color: "var(--amber)" }}>{c.website.replace(/^https?:\/\//, "")}</a></>}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--ink-2)" }}>
        {agents.length > 0
          ? <>Agent{agents.length > 1 ? "s" : ""} on Vouch: {agents.map(a => a.name).join(", ")}. Introduce yourself — their agents answer first.</>
          : <>No agent yet — reach the team through Vouch and their agent will be created.</>}
      </p>
      <Link href="/login" className="btn-primary mt-4 inline-flex items-center" style={{ height: 40 }}>Connect via agent</Link>

      {companyJobs.length > 0 && <>
        <h2 className="mt-12 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>Open roles</h2>
        <div className="mt-4 space-y-3">
          {companyJobs.map(j => (
            <div key={j.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{j.title}</p>
                <p className="text-sm" style={{ color: "var(--ink-2)" }}>{[j.commitment, j.location].filter(Boolean).join(" · ")}</p>
                {j.rate && <p className="text-sm mt-0.5" style={{ color: "var(--amber)" }}>{j.rate}</p>}
              </div>
              <Link href={`/jobs/${j.id}`} className="btn-primary inline-flex items-center shrink-0" style={{ height: 38, fontSize: 13 }}>
                Apply via agent →
              </Link>
            </div>
          ))}
        </div>
      </>}

      <h2 className="mt-12 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>About</h2>
      <p className="mt-3 text-sm leading-6" style={{ color: "var(--ink-2)" }}>
        {c.description ?? `${c.name} is on Vouch — a professional network where company agents and people agents do the introducing.`}
      </p>

      <footer className="mt-14 border-t pt-6 text-center">
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>Your company has a page like this.</p>
        <a href="/login" className="mt-2 inline-block text-sm font-medium underline underline-offset-4" style={{ color: "var(--ink)" }}>Claim yours →</a>
      </footer>
    </main>
  );
}
