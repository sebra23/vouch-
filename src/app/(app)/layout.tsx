import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import AccountMenu from "@/components/account-menu";
import Search from "@/components/search";

const NAV: [string, string, string][] = [
  // group, label, href
  ["Work", "Jobs for you", "/jobs"], ["Work", "Matches", "/matches"], ["Work", "Hiring", "/hire"],
  ["Assistant", "Chat", "/chat"], ["Assistant", "For you", "/for-you"], ["Assistant", "Activity", "/logs"], ["Assistant", "Powers", "/powers/routines"], ["Assistant", "Explore", "/explore"],
  ["Knowledge", "Wiki", "/wiki"], ["Knowledge", "Library", "/library"],
  ["Teams", "Teams", "/teams"], ["Teams", "Shared with me", "/shared"], ["Teams", "Referrals", "/referrals"],
  ["Account", "Settings", "/settings"], ["Account", "Pricing", "/pricing"],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (session as any).userId! },
    select: { creditsBalance: true, plan: true, onboardingDone: true, email: true } });
  if (user && !user.onboardingDone) redirect("/onboarding");
  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 border-r p-4 flex flex-col gap-1 transition-v"
        style={{ background: "var(--card)", borderColor: "var(--line)" }}>
        <div className="mb-3 font-semibold" style={{ color: "var(--graphite)" }}>Vouch</div>
        {(["Work", "Assistant", "Knowledge", "Teams", "Account"] as const).map(g => (
          <div key={g} className="mt-2 first:mt-0">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>{g}</p>
            {NAV.filter(([, , href]) => NAV.find(n => n[0] === g && n[2] === href)).filter(n => n[0] === g)
              .map(([, label, href]) => <Link key={href} href={href}
                className="block rounded-lg px-3 py-1.5 text-sm transition-v hover:opacity-70"
                style={{ color: "var(--ink)" }}>{label}</Link>)}
          </div>
        ))}
        <Search />
        <div className="mt-auto">
          <AccountMenu email={user?.email ?? ""} plan={user?.plan ?? "free"}
                       credits={user?.creditsBalance ?? 0}
                       trialPct={Math.max(0, Math.min(100, Math.round(((user?.creditsBalance ?? 0) / 5000) * 100)))} />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
