import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import CopyButton from "@/components/copy-button";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  const code = Buffer.from(email).toString("base64url").slice(0, 10);
  const link = `https://ari.app/?invite=${code}`;

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-xl font-semibold">Earn 2,000 credits per friend referral</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Know someone who could use an assistant? Give eligible friends two free weeks of Pro.
      </p>

      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="text-sm font-medium">Share your referral link</div>
        <div className="mt-2 flex gap-2">
          <input readOnly value={link} className="flex-1 rounded-lg border bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
            onFocus={e => e.target.select()} />
          <CopyButton value={link} />
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          They get a 14-day Pro trial (standard is 7-day). You earn 2,000 credits when they start a qualifying paid subscription.
        </p>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="text-sm font-medium">Other ways to earn</div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>Share your assistant — earn 300 credits when 10 unique people view its page.</span>
          <span className="text-neutral-400">0 / 10 views</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-neutral-400">Referral tracking activates when billing launches — links shared now carry your code and credit retroactively.</p>
    </div>
  );
}
