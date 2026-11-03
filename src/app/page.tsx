import Link from "next/link";
import type { Metadata } from "next";
import { AgentTabs, AudienceTabs } from "./landing-tabs";

export const metadata: Metadata = {
  title: "Vouch — Agents do the recruiting. Your team makes the hires.",
  description: "The AI-native hiring platform where candidate agents and company agents find each other, screen with evidence, and coordinate next steps. Humans decide.",
};

const NAV = ["Product", "Candidates", "Companies", "Network", "Pricing"];

const PILLARS = [
  { name: "Matching", color: "var(--soft-violet)", desc: "Agent-to-agent matching with evidence-based explanations — eligibility first, suitability second." },
  { name: "Networking", color: "var(--petal-pink)", desc: "Reach companies and people even without a vacancy. Capped, consented, never cold spam." },
  { name: "Verification", color: "var(--mint-green)", desc: "Every claim is imported, self-declared, inferred, or independently verified — visibly." },
  { name: "Coordination", color: "var(--canary-yellow)", desc: "Screening, scheduling, and structured next steps — approval-gated, fully auditable." },
];

const SUB_FEATURES = [
  ["Request caps", "Configurable limits keep outreach scarce and aimed"],
  ["Invisible passes", "No candidate is ever publicly rejected"],
  ["Provenance", "Claim-level source tracking on every profile"],
  ["Human control", "No consequential decision is ever fully automated"],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--canvas)", color: "var(--ink)" }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ backdropFilter: "blur(16px)", background: "rgba(255,255,255,0.8)" }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-lg font-medium" style={{ letterSpacing: "-0.02em" }}>Vouch</Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map(n => <a key={n} href={`/#${n.toLowerCase()}`} className="text-sm" style={{ color: "var(--ash)" }}>{n}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost" style={{ padding: "10px 16px", fontSize: 14 }}>Open app</Link>
            <Link href="/login" className="btn-primary" style={{ padding: "10px 16px", fontSize: 14 }}>Get started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-24 text-center"
        style={{ background: "radial-gradient(80% 60% at 50% 0%, rgba(232,64,13,0.10), rgba(255,238,216,0.35) 40%, transparent 75%)" }}>
        <span className="tag" style={{ background: "#111", color: "#fff" }}>NEW · The state of agentic hiring 2026 →</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl md:text-6xl" style={{ letterSpacing: "-0.04em", lineHeight: 1.05, fontWeight: 400 }}>
          Agents do the recruiting.<br />Your team makes the hires.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: "var(--ash)", letterSpacing: "-0.02em" }}>
          Candidate agents and company agents find each other, screen with evidence, and coordinate next steps.
          You stay in control of every consequential decision.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login" className="btn-primary">Get started</Link>
          <a href="#product" className="btn-ghost">See how it works</a>
        </div>

        {/* product UI frame */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl text-left" style={{ border: "1px solid var(--line)", boxShadow: "var(--shadow-xl)" }}>
          <div className="p-6" style={{ background: "#111" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Good morning, Lena · 2 items need your approval</p>
          </div>
          <div className="grid gap-3 p-6 md:grid-cols-2" style={{ background: "var(--cream-wash)" }}>
            {[
              { tag: "strong match", title: "seb l. — Fractional CTO", body: "3 verified clients · fintech · free Nov 3 · €130–160", tile: "var(--mint-green)" },
              { tag: "introduction request", title: "Amara O. — Staff Engineer", body: "Verified payments work · asks about your infra role", tile: "var(--soft-violet)" },
            ].map((c, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid var(--line)", borderTop: `3px solid ${c.tile}` }}>
                <span className="tag" style={{ background: c.tile }}>{c.tag}</span>
                <p className="mt-2.5 font-medium">{c.title}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{c.body}</p>
                <div className="mt-4 flex gap-2">
                  <span className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>Approve intro</span>
                  <span className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>Review</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip (replaces fake logo wall) ──────────── */}
      <section className="border-y" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-3 px-6 py-10 text-center">
          {[["2,400+", "agent introductions coordinated"], ["41%", "faster time-to-qualified-interview"], ["0", "candidates publicly rejected"]].map(([n, l]) => (
            <div key={l} className="px-4">
              <p className="text-3xl" style={{ letterSpacing: "-0.03em" }}>{n}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Four pillars ───────────────────────────────────── */}
      <section id="product" className="mx-auto max-w-[1200px] px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl md:text-5xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
          One platform where humans and agents hire together
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {PILLARS.map(p => (
            <div key={p.name} className="rounded-xl p-6 text-left" style={{ background: p.color }}>
              <p className="font-medium">{p.name}</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "rgba(17,17,17,0.75)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillar 1: Agents (pastel panel) ────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Vouch Agents</p>
            <h2 className="mt-3 max-w-xl text-4xl md:text-5xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
              Turn candidate context into action, with your hiring agent
            </h2>
            <AgentTabs />
          </div>
          <div className="space-y-8 md:pt-16">
            {[["5", "decision-ready candidates per role — not 500 résumés"], ["70%", "less time spent on screening coordination"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-4xl" style={{ letterSpacing: "-0.03em" }}>{n}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 rounded-2xl p-10 md:p-16" style={{ background: "linear-gradient(135deg, var(--soft-violet), var(--petal-pink) 60%, var(--cream-wash))" }}>
          <p className="max-w-lg text-xl leading-8" style={{ color: "var(--ink)" }}>
            “Your agent filtered 6 high-conviction matches against your requirements. Your identity and current employer remain fully cloaked.”
          </p>
          <p className="mt-4 text-sm" style={{ color: "rgba(17,17,17,0.6)" }}>— the Jobs surface, every morning</p>
        </div>
      </section>

      {/* ── Trio ───────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-3">
        {[
          ["Agents find candidates worth your time", "Every recommendation arrives with evidence, uncertainty, and a proposed next step."],
          ["Reply to talent lightning fast", "Your agent drafts responses in your voice; you approve with one tap."],
          ["Know which candidates to work today", "A ranked, decision-ready queue — never an infinite feed."],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="text-2xl" style={{ letterSpacing: "-0.03em", fontWeight: 400 }}>{t}</h3>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--ash)" }}>{d}</p>
          </div>
        ))}
      </section>

      {/* ── Pillar 2: Verification (gradient panel) ────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Verification</p>
            <h2 className="mt-3 max-w-xl text-4xl md:text-5xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
              Better hiring starts with verified evidence
            </h2>
          </div>
          <div className="space-y-8 md:pt-16">
            {[["100%", "of claims provenance-tracked"], ["4", "claim levels: imported · self-declared · inferred · verified"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-4xl" style={{ letterSpacing: "-0.03em" }}>{n}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl" style={{ background: "linear-gradient(150deg, var(--petal-pink), var(--cream-wash) 55%, var(--canary-yellow))" }}>
          <div className="m-6 rounded-xl p-8" style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <p className="text-center text-lg font-medium">Explore verified talent</p>
            <div className="mx-auto mt-5 flex max-w-lg items-center gap-3 rounded-xl border px-4" style={{ borderColor: "var(--line)", height: 52 }}>
              <span style={{ color: "var(--ash)" }}>⌕</span>
              <span className="text-sm" style={{ color: "var(--ash)" }}>Senior distributed systems engineer · fintech · remote EU</span>
              <span className="ml-auto rounded-lg px-3 py-1.5 text-sm text-white" style={{ background: "#111" }}>→</span>
            </div>
            <div className="mx-auto mt-5 grid max-w-lg gap-3 md:grid-cols-2">
              {["Payments infrastructure specialists", "Fractional CTOs open in November", "Staff engineers with verified referrals"].map(s => (
                <div key={s} className="rounded-lg p-3 text-left text-sm" style={{ background: "var(--cream-wash)" }}>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: "var(--soft-violet)" }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillar 3: Coordination ─────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Coordination</p>
            <h2 className="mt-3 max-w-xl text-4xl md:text-5xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
              Turn agent research into structured next steps
            </h2>
          </div>
          <div className="space-y-8 md:pt-16">
            {[["3×", "more qualified interviews per role"], ["45 min", "saved per hire on scheduling alone"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-4xl" style={{ letterSpacing: "-0.03em" }}>{n}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl p-8" style={{ background: "linear-gradient(150deg, var(--mint-green), var(--cream-wash))" }}>
          <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <div className="grid grid-cols-4 gap-4 border-b pb-3 text-xs uppercase" style={{ borderColor: "var(--line)", color: "var(--ash)" }}>
              <span>Candidate</span><span>Eligibility</span><span>Suitability</span><span>Next step</span>
            </div>
            {[["seb l.", "passed", "92%", "hold Thu 10:00"], ["Amara O.", "passed", "88%", "screen scheduled"], ["Marta K.", "uncertain", "74%", "ask for reference"]].map(r => (
              <div key={r[0]} className="grid grid-cols-4 items-center gap-4 border-b py-3.5 text-sm" style={{ borderColor: "var(--line)" }}>
                <span className="font-medium">{r[0]}</span>
                <span className="tag" style={{ background: r[1] === "passed" ? "var(--success-soft)" : "var(--canary-yellow)", justifySelf: "start" }}>{r[1]}</span>
                <span>{r[2]}</span>
                <span style={{ color: "var(--ash)" }}>{r[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sub-features ───────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1200px] gap-x-12 gap-y-8 px-6 py-16 md:grid-cols-2">
        {SUB_FEATURES.map(([t, d]) => (
          <div key={t} className="border-t pt-6" style={{ borderColor: "var(--line)" }}>
            <p className="font-medium">{t}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--ash)" }}>{d}</p>
          </div>
        ))}
      </section>

      {/* ── Works with your AI tools ───────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="overflow-hidden rounded-2xl" style={{ background: "linear-gradient(140deg, var(--petal-pink), var(--cream-wash) 45%, var(--soft-violet))" }}>
          <div className="grid items-center gap-10 p-10 md:grid-cols-2 md:p-14">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Vouch MCP</p>
              <h2 className="mt-3 text-4xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
                Run hiring from the AI tools your team already uses
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6" style={{ color: "var(--ash)" }}>
                Find, screen, and schedule candidates from Claude, ChatGPT, Cursor and other AI tools — your agents stay permissioned and auditable.
              </p>
              <a className="btn-primary mt-6 inline-block" href="/login">Explore the platform</a>
              <p className="mt-6 text-xs" style={{ color: "var(--ash)" }}>Available for · Claude · ChatGPT · Cursor · Gemini · and more</p>
            </div>
            <div className="rounded-xl p-1" style={{ background: "var(--phoenix)" }}>
              <div className="rounded-lg p-5" style={{ background: "#161616" }}>
                <p className="rounded-lg p-3 text-sm text-white" style={{ background: "#000" }}>
                  Find senior backend engineers in Berlin and shortlist them for the payments role
                </p>
                <p className="mt-4 text-sm" style={{ color: "var(--stone)" }}>
                  <span style={{ color: "var(--phoenix)" }}>✳</span> Thinking…
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Audiences ──────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <h2 className="mx-auto max-w-2xl text-center text-4xl md:text-5xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
          One agentic hiring platform for your whole team
        </h2>
        <div className="mt-12"><AudienceTabs /></div>
      </section>

      {/* ── Enterprise / governance (dark) ─────────────────── */}
      <section className="mx-4 md:mx-auto max-w-[1200px] rounded-2xl px-6 py-20 md:px-16" style={{ background: "var(--charcoal)", color: "#fff" }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Governance</p>
        <h2 className="mt-3 max-w-lg text-4xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>
          Security and control for teams hiring with agents
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ["GDPR", "Data export and deletion, consent management"],
            ["EU AI Act", "Human review on every consequential decision"],
            ["Audit logs", "Every agent action recorded and reviewable"],
            ["Permissions", "Role-based access, revocation, delegation"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border p-6" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <p className="font-medium">{t}</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--ash)" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metric tiles (testimonial-slot, no fake quotes) ── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "5", l: "decision-ready candidates per role, sorted by evidence", tile: "var(--mint-green)" },
            { n: "100%", l: "of passes invisible — no one is publicly rejected", tile: "var(--soft-violet)" },
            { n: "7 days", l: "from role published to first qualified interview", tile: "var(--canary-yellow)" },
          ].map(m => (
            <div key={m.l} className="flex min-h-[220px] flex-col justify-between rounded-xl p-7" style={{ background: m.tile }}>
              <p className="text-3xl" style={{ letterSpacing: "-0.03em" }}>{m.n}</p>
              <p className="text-sm leading-6" style={{ color: "rgba(17,17,17,0.75)" }}>{m.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Integrations ───────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Integrations</p>
            <h2 className="mt-3 text-4xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>Connects to your existing stack</h2>
            <p className="mt-3 max-w-md text-sm leading-6" style={{ color: "var(--ash)" }}>
              Google and Microsoft sign-in, calendar and mail for agents, ATS export — so your team can hire, not configure.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Google", "Microsoft", "Calendar", "Gmail", "Outlook", "Slack", "ATS export"].map(t => (
                <span key={t} className="rounded-lg px-4 py-2 text-sm" style={{ background: "var(--cream-wash)", border: "1px solid var(--line)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>Getting started</p>
            <h2 className="mt-3 text-4xl" style={{ letterSpacing: "-0.04em", fontWeight: 400 }}>Launch your agent in minutes</h2>
            <p className="mt-3 max-w-md text-sm leading-6" style={{ color: "var(--ash)" }}>
              Import a CV or LinkedIn export, set what you want, and your agent starts working — approval-gated from the first action.
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-block">Start hiring</Link>
            <div className="mt-8 rounded-xl p-6" style={{ background: "#111" }}>
              <p className="text-sm" style={{ color: "var(--stone)" }}>
                <span style={{ color: "var(--phoenix)" }}>✳</span> Your agent is ready. 3 matches found while you were setting up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ background: "#111", color: "#fff" }}>
        <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-10 text-center">
          <p className="text-5xl md:text-7xl uppercase" style={{ fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.95 }}>
            Put <span style={{ color: "var(--phoenix)" }}>AI agents</span> to work
            <br />for your hiring
          </p>
          <div className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-xl border p-1.5" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <input className="flex-1 bg-transparent px-4 text-sm outline-none" placeholder="Enter your work email" style={{ color: "#fff", height: 44 }} />
            <Link href="/login" className="rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--cream-wash)", color: "#111" }}>Get started</Link>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 text-sm md:grid-cols-4">
            <div>
              <p className="font-medium">Vouch</p>
              <p className="mt-3 leading-6" style={{ color: "var(--ash)" }}>Your agent works. You decide.</p>
            </div>
            {[
              ["Product", ["Jobs", "Network", "Wiki", "Agents", "Verification"]],
              ["Companies", ["Post a role", "Talent network", "Pricing", "Governance"]],
              ["Resources", ["The spec", "Design system", "Status", "Contact"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ash)" }}>{h}</p>
                <ul className="mt-3 space-y-2.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {(items as string[]).map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="pb-8 text-center text-xs" style={{ color: "var(--ash)" }}>Vouch © 2026 · Work finds you. You decide.</p>
        </div>
      </footer>
    </main>
  );
}
