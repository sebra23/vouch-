import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { runAgent } from "@/lib/agent/run";
import { sendAsAssistant } from "@/lib/mail/send";
import { log } from "@/lib/logs";

// POST /api/intake/decide { threadId, decision: "approve" | "decline" | "keep" }
// Owner-only. approve → thread opens, intro email to peer (first & only guest email).
// decline → agent writes a polite closure; guest sees it on their view; NO email to peer.
// keep → agent continues the gatekeeper conversation with an extra owner nudge.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const j = await req.json().catch(() => null);
  if (!j?.threadId || !["approve", "decline", "keep"].includes(j.decision))
    return NextResponse.json({ error: "bad request" }, { status: 400 });

  const thread = await prisma.thread.findFirst({ where: { id: j.threadId, userId, source: "intake" } });
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const assistant = await prisma.assistant.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!assistant || !user) return NextResponse.json({ error: "assistant missing" }, { status: 500 });

  const peer = { name: thread.peerName ?? "there", email: thread.peerEmail ?? "" };
  const ownerFirst = (user.name ?? "me").split(" ")[0];

  if (j.decision === "approve") {
    await prisma.thread.update({ where: { id: thread.id }, data: { status: "open", source: "owner" } });
    const intro = await runAgent(userId,
      `[owner approved] Introduce yourself to ${peer.name} (${peer.email}) and connect them with ${ownerFirst}. Write the intro email text now — it will be sent to ${peer.email}.`,
      thread.id);
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: intro } });
    // First and only email the guest ever receives (spec §4.5).
    if (peer.email) {
      try {
        await sendAsAssistant(assistant.slug!, assistant.name, userId, peer.email,
          `Introduction to ${ownerFirst}`, intro);
      } catch (e) { console.error("intro send failed", e); }
    }
    await log(userId, "intake", `Approved intro to ${peer.name} — thread opened`);
  }

  if (j.decision === "decline") {
    const closure = await runAgent(userId,
      `[owner declined] Write a brief, warm, final message to ${peer.name} declining for now. Do not ask follow-up questions. Do not mention the owner's reasons.`,
      thread.id, { allowedTools: [] }); // no tools needed; also proves closure can't touch anything
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: closure } });
    await prisma.thread.update({ where: { id: thread.id }, data: { status: "closed" } });
    await log(userId, "intake", `Declined ${peer.name} — thread closed`);
  }

  if (j.decision === "keep") {
    const nudge = await runAgent(userId,
      `[owner note] Keep engaging ${peer.name} — owner wants more info before deciding. Ask the most useful clarifying question you don't already have an answer to.`,
      thread.id, { allowedTools: ["calendar_list_events", "gmail_search"] });
    await prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: nudge } });
    await log(userId, "intake", `Kept talking with ${peer.name}`);
  }

  return NextResponse.json({ ok: true });
}
