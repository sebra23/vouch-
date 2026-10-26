import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { runAgent } from "@/lib/agent/run";
import { sendAsAssistant } from "@/lib/mail/send";
import { log } from "@/lib/logs";
import { rateOk as rateOkGuard, HitMap } from "@/lib/intake/guards";

// v0.1: in-memory rate limit (3/IP/hour). Resets on serverless cold start —
// recorded as known limitation in docs/EVIDENCE_PUBLIC_PROFILE.md.
const hits: HitMap = new Map();
const rateOk = (ip: string) => rateOkGuard(hits, ip);

// Intake threads run read-only: they can look at calendar/mail context for
// drafting quality, but can never create drafts or labels (spec §4).
const READ_ONLY_TOOLS = ["calendar_list_events", "gmail_search"];

export async function POST(req: Request) {
  const j = await req.json().catch(() => null);
  if (!j?.publicSlug || !j?.message || !j?.name || !j?.email)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  // Honeypot: bots fill the hidden field — pretend success, drop silently.
  if (j.website) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateOk(ip)) return NextResponse.json({ error: "too many requests" }, { status: 429 });

  const assistant = await prisma.assistant.findFirst({
    where: { publicSlug: String(j.publicSlug).toLowerCase(), isPublic: true },
    include: { user: true },
  });
  if (!assistant) return NextResponse.json({ error: "not found" }, { status: 404 }); // no existence hints

  const user = assistant.user;
  const ownerFirst = (user.name ?? "the owner").split(" ")[0];
  const token = crypto.randomUUID();

  const thread = await prisma.thread.create({ data: {
    userId: user.id,
    source: "intake",
    status: "awaiting_owner",
    title: `Intake: ${String(j.name).slice(0, 40)}`,
    peerName: String(j.name).slice(0, 120),
    peerEmail: String(j.email).slice(0, 200),
    publicToken: token,
  }});
  await prisma.message.create({ data: { threadId: thread.id, role: "user",
    content: `[intake from ${j.name} <${j.email}>]\n${String(j.message).slice(0, 1000)}` } });

  // Gatekeeper run: locked prompt + read-only tools. Failures degrade to a safe ack.
  try {
    const reply = await runAgent(user.id, `[intake message] ${j.message}`, thread.id, {
      allowedTools: READ_ONLY_TOOLS,
      systemPrompt: `You are ${assistant.name}, gatekeeper for ${user.name ?? "your owner"} (${assistant.slug}).
Personality: ${assistant.personality}
Your job: engage genuinely with this inbound request and ask 1-2 clarifying questions about scope, timing, and fit.
Hard rules: make NO commitments; never imply ${ownerFirst} has agreed to anything; never claim an email was sent;
never reveal ${ownerFirst}'s private email, calendar contents, or any private data. Be concise and warm.`,
    });
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: reply } });
  } catch (e: any) {
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant",
      content: "Thanks — I've logged this for review and will come back to you." } });
  }

  await log(user.id, "intake", `New intake from ${j.name} — awaiting your decision`);

  // Notify the OWNER (decision card link). The guest is NEVER emailed here —
  // that would turn the form into a spam vector (Toby condition 1).
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    await sendAsAssistant(assistant.slug!, assistant.name, user.id, user.email!,
      `${assistant.name}: new request from ${j.name}`,
      `${j.name} <${j.email}> reached your public page.\n\n"${String(j.message).slice(0, 300)}"\n\nReview and decide: ${base}/chat/${thread.id}`);
  } catch { /* owner notification must never break intake */ }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return NextResponse.json({ ok: true, tokenUrl: `${base}/v/${token}` });
}
