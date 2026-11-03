import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import AccountMenu from "@/components/account-menu";
import Search from "@/components/search";
import { MobileNav } from "./nav-client";
import UserSwitcher, { type Persona } from "./user-switcher";

const NAV: [string, string, string][] = [
  // group, label, href — primary surface per the four-page architecture
  ["Vouch", "Today", "/today"], ["Vouch", "Jobs", "/jobs"], ["Vouch", "Network", "/network"], ["Vouch", "Wiki", "/wiki"],
  ["Agent", "Chat", "/chat"], ["Agent", "Activity", "/logs"], ["Agent", "For you", "/for-you"],
  ["More", "Matches", "/matches"], ["More", "Hiring", "/hire"], ["More", "Powers", "/powers/routines"],
  ["Account", "Settings", "/settings"], ["Account", "Pricing", "/pricing"],
];

const NAV_ENTRIES = NAV.map(([group, label, href]) => ({ group, label, href }));

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (session as any).userId! },
    select: { creditsBalance: true, plan: true, onboardingDone: true, email: true } });
  if (user && !user.onboardingDone) redirect("/onboarding");

  // demo personas for the user switcher (demo mode only)
  const demoEmails = ["demo@ari.local", "lena@vouch.demo", "amara@vouch.demo"];
  const personaMeta: Record<string, { role: string; tile: string }> = {
    "demo@ari.local": { role: "Candidate · fractional CTO", tile: "var(--soft-violet)" },
    "lena@vouch.demo": { role: "Employer · Nordfintech", tile: "var(--mint-green)" },
    "amara@vouch.demo": { role: "Candidate · staff engineer", tile: "var(--petal-pink)" },
  };
  const personas: Persona[] = process.env.NEXT_PUBLIC_DEMO === "1"
    ? (await prisma.user.findMany({ where: { email: { in: demoEmails } } }))
        .map(u => ({ email: u.email, name: u.name ?? u.email, role: personaMeta[u.email]?.role ?? "Demo", tile: personaMeta[u.email]?.tile ?? "var(--pearl)" }))
    : [];

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* mobile: top bar + drawer */}
      <MobileNav entries={NAV_ENTRIES} brand="Vouch" personas={personas} current={user?.email ?? ""} />

      {/* desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r p-4 transition-v md:flex"
        style={{ background: "var(--card)", borderColor: "var(--line)" }}>
        <div className="mb-3 font-semibold" style={{ color: "var(--graphite)" }}>Vouch</div>
        {(["Vouch", "Agent", "More", "Account"] as const).map(g => (
          <div key={g} className="mt-2 first:mt-0">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>{g}</p>
            {NAV.filter(([, , href]) => NAV.find(n => n[0] === g && n[2] === href)).filter(n => n[0] === g)
              .map(([, label, href]) => <Link key={href} href={href}
                className="block rounded-lg px-3 py-1.5 text-sm transition-v hover:opacity-70"
                style={{ color: "var(--ink)" }}>{label}</Link>)}
          </div>
        ))}
        <Search />
        <div className="mt-auto space-y-2">
          {personas.length > 0 && <UserSwitcher personas={personas} current={user?.email ?? ""} />}
          <AccountMenu email={user?.email ?? ""} plan={user?.plan ?? "free"}
                       credits={user?.creditsBalance ?? 0}
                       trialPct={Math.max(0, Math.min(100, Math.round(((user?.creditsBalance ?? 0) / 5000) * 100)))} />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
