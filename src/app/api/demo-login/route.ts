import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_DEMO !== "1") return NextResponse.redirect(new URL("/login", req.url));
  let demo = await prisma.user.findUnique({ where: { email: "demo@ari.local" } });
  if (!demo) {
    demo = await prisma.user.create({ data: { email: "demo@ari.local", name: "Demo User",
      onboardingDone: true, plan: "pro", creditsBalance: 5000 } });
    await prisma.assistant.create({ data: { userId: demo.id, name: "Column",
      slug: "column-demo", personality: "Minimal, high-signal, and brief.",
      // Public-page demo seed: live page + receipts + one pending intake (decision card visible)
      isPublic: true, publicSlug: "column-demo",
      tagline: "Direct, precise, and always observant.",
      openTo: ["fractional-cto", "advisory"], notOpenTo: ["full-time"],
      capacity: "12h/wk from Nov 3",
      publicReceipts: [
        { title: "Closed 14 DB migrations — Q3", detail: "Zero-downtime cutovers for a fintech scale-up", coSigners: 2 },
        { title: "Led GTM for analytics launch", detail: "", coSigners: 0 },
      ] } });
    const demoThread = await prisma.thread.create({ data: { userId: demo.id,
      source: "intake", status: "awaiting_owner", title: "Intake: Alex Rivera",
      peerName: "Alex Rivera", peerEmail: "alex@example.com",
      publicToken: "demo-token-0000-0000-000000000001" } });
    await prisma.message.createMany({ data: [
      { threadId: demoThread.id, role: "user", content: "[intake from Alex Rivera <alex@example.com>]\nHi — we need a fractional CTO for a fintech pivot, ~10h/wk starting November. Budget is open for the right person." },
      { threadId: demoThread.id, role: "assistant", content: "Thanks, Alex. A few quick questions so I can see if this is a fit: what's the team size today, and is the pivot already funded or still being raised?" },
    ] });
  }
  const token = await encode({ token: { sub: demo.id, email: demo.email, name: demo.name },
    secret: process.env.NEXTAUTH_SECRET!, maxAge: 30 * 24 * 3600 });
  const res = NextResponse.redirect(new URL("/chat", req.url));
  // NextAuth uses the __Secure- prefixed cookie on https/production
  const secure = new URL(req.url).protocol === "https:";
  const name = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  res.cookies.set(name, token, { httpOnly: true, sameSite: "lax", path: "/", secure });
  return res;
}