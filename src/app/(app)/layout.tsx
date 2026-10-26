import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import AccountMenu from "@/components/account-menu";
import Search from "@/components/search";

const NAV = [
  ["Chat", "/chat"], ["For you", "/for-you"], ["Powers", "/powers/routines"],
  ["Explore", "/explore"], ["Wiki", "/wiki"], ["Library", "/library"],
  ["Teams", "/teams"], ["Shared with me", "/shared"], ["Referrals", "/referrals"], ["Pricing", "/pricing"],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (session as any).userId! },
    select: { creditsBalance: true, plan: true, onboardingDone: true, email: true } });
  if (user && !user.onboardingDone) redirect("/onboarding");
  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 border-r bg-white p-4 flex flex-col gap-1">
        <div className="mb-3 font-semibold">Ari</div>
        {NAV.map(([label, href]) => <Link key={href} href={href}
          className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">{label}</Link>)}
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
