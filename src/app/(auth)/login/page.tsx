"use client";
import { signIn } from "next-auth/react";
export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-neutral-50">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Ari</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your assistant for email, calendar and follow-ups. It never sends anything without your approval.
        </p>
        <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="mt-6 w-full rounded-lg bg-neutral-900 py-2.5 text-white">Continue with Google</button>
        <button onClick={() => signIn("azure-ad", { callbackUrl: "/onboarding" })}
          className="mt-3 w-full rounded-lg border py-2.5">Continue with Microsoft</button>
        {process.env.NEXT_PUBLIC_DEMO === "1" && (
          <a href="/api/demo-login" className="mt-3 block text-center text-sm text-neutral-500 underline">Explore the demo (no account needed)</a>
        )}
      </div>
    </main>
  );
}
