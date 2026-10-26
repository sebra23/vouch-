const TIERS = [
  { name: "Free", price: "$0", period: "forever", credits: "30 chats / month", features: ["Personal assistant (chat)", "Weekly morning briefing", "All integrations included", "7-day Pro trial on signup"] },
  { name: "Starter", price: "$15", period: "/month", credits: "1,250 credits / month", features: ["Everything in Free, plus:", "Daily morning briefing", "Auto-inbox triage, drafts, scheduling", "2 custom routines", "Email support"] },
  { name: "Pro", price: "$49", period: "/month, annual", credits: "5,000 credits / month", features: ["Everything in Starter, plus:", "Unlimited custom routines", "Automatic meeting briefings", "Pay-as-you-go overage", "Priority routing"] },
  { name: "Power", price: "$99", period: "/month, annual", credits: "12,000 credits / month", features: ["Everything in Pro, plus:", "Lower per-credit cost", "Higher concurrent routine limits"] },
];

export default function PricingPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Pricing</h1>
      <p className="mt-1 text-sm text-neutral-500">Start free. Upgrade when it earns its keep.</p>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {TIERS.map(t => <div key={t.name} className="rounded-2xl border bg-white p-6">
          <div className="font-medium">{t.name}</div>
          <div className="mt-2 text-3xl font-semibold">{t.price}<span className="text-sm font-normal text-neutral-500"> {t.period}</span></div>
          <div className="mt-2 text-xs font-medium text-neutral-600">{t.credits}</div>
          <ul className="mt-4 space-y-1.5 text-sm text-neutral-700">
            {t.features.map(f => <li key={f}>· {f}</li>)}
          </ul>
          <button className="mt-5 w-full rounded-lg bg-neutral-900 py-2 text-sm text-white">
            {t.name === "Free" ? "Start free" : "Upgrade"}
          </button>
        </div>)}
      </div>
      <p className="mt-6 text-xs text-neutral-400">Checkout opens after launch — payments not enabled during beta.</p>
    </div>
  );
}
