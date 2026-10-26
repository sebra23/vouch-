import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { runAgent } from "@/lib/agent/run";
import { spendCredits } from "@/lib/credits";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session as any).userId!;
  const { message, threadId } = await req.json();

  const thread = threadId
    ? await prisma.thread.findFirst({ where: { id: threadId, userId } })
    : await prisma.thread.create({ data: { userId, title: message.slice(0, 48) } });

  if (!thread) return NextResponse.json({ error: "thread not found" }, { status: 404 });
  const assistant = await prisma.assistant.findUnique({ where: { userId } });
  const wiki = await prisma.wikiPage.findMany({ where: { userId }, take: 5 });
  const history = await prisma.message.findMany({ where: { threadId: thread.id }, orderBy: { id: "asc" }, take: 40 });

  let reply: string;
  if (!process.env.AI_API_KEY) {
    reply = `[demo mode — no AI key configured] I received: "${message.slice(0, 200)}". With an AI key set, I would use Gmail/Calendar tools here. I never send anything without your approval.`;
  } else {
    try { reply = await runAgent(userId, message, thread.id); }
    catch (e: any) { reply = `Error: ${e.message}`; }
  }

  await prisma.$transaction([
    prisma.message.create({ data: { threadId: thread.id, role: "user", content: message } }),
    prisma.message.create({ data: { threadId: thread.id, role: "assistant", content: reply } }),
  ]);
  await spendCredits(userId, 5);
  return NextResponse.json({ threadId: thread.id, reply });
}