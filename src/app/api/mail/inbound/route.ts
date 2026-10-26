import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAgent } from "@/lib/agent/run";
import { sendAsAssistant, MAIL_DOMAIN } from "@/lib/mail/send";

// POST /api/mail/inbound
// Receives inbound email (Resend Inbound Relay / compatible webhook), verifies the
// sender is the assistant's owner, runs the agent, replies from the assistant's address.
export async function POST(req: Request) {
  const j = await req.json();
  // Resend inbound relay shape; tolerate generic {from,to,text,subject}
  const from: string = j.from || j?.envelope?.from;
  const to: string   = (Array.isArray(j.to) ? j.to[0] : j.to) || j?.envelope?.to?.[0] || "";
  const subject: string = j.subject || "(no subject)";
  const text: string = j.text || j?.html?.replace(/<[^>]+>/g, " ") || "";

  const slug = to.split("@")[0]?.toLowerCase().trim();
  if (!from || !slug) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const assistant = await prisma.assistant.findFirst({ where: { slug } });
  if (!assistant) return NextResponse.json({ error: "unknown assistant" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: assistant.userId } });
  if (!user) return NextResponse.json({ error: "owner missing" }, { status: 404 });

  // Security: only the owner can trigger the assistant by email (matches Town's model).
  const sender = from.toLowerCase();
  const owner = user.email?.toLowerCase();
  if (!owner || sender !== owner)
    return NextResponse.json({ error: "sender is not the assistant's owner" }, { status: 403 });

  const thread = await prisma.thread.create({ data: { userId: user.id, title: `Email: ${subject}`.slice(0, 48) } });
  await prisma.message.create({ data: { threadId: thread.id, role: "user", content: `[email] ${subject}\n\n${text}` } });

  let reply: string;
  try { reply = await runAgent(user.id, `[email from me] Subject: ${subject}\n\n${text}`, thread.id); }
  catch (e: any) { reply = `Error: ${e.message}`; }

  await prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: reply } });
  try { await sendAsAssistant(assistant.slug!, assistant.name, user.id, user.email!, `Re: ${subject}`, reply); }
  catch (e) { console.error("assistant reply send failed", e); }

  return NextResponse.json({ ok: true, domain: MAIL_DOMAIN });
}
