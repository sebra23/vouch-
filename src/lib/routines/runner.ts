import { prisma } from "../db";
import { chat } from "../ai/client";
import { TOOL_DEFS } from "../ai/tools";
import { spendCredits } from "../credits";
import { sendAsAssistant } from "../mail/send";

const PROMPTS: Record<string, (u: any) => string> = {
  "morning-briefing": u => `You are ${u.assistantName}, a personal chief-of-staff with personality "${u.personality}".
Write today's morning briefing email for ${u.name}. Include: (1) today's schedule from calendar, (2) urgent unread emails needing a reply, (3) one insight from recent mail. Plain text, concise, skimmable.`,
  "auto-inbox": u => `You are ${u.assistantName}. Triage recent unread emails for ${u.name}: for each important one, apply a label (IMPORTANT/NEEDS-REPLY/NEWSLETTER/FYI) and, where a reply is clearly warranted, create a DRAFT reply (never send). Skip newsletters unless urgent. Summarize what you did.`,
  "loose-ends": u => `You are ${u.assistantName}. Scan ${u.name}'s sent mail and open threads for unanswered obligations — things they owe people. Send one private summary email listing each loose end and suggested next step.`,
  "meeting-briefing": u => `You are ${u.assistantName}. Find meetings in the next 24h for ${u.name} and write a concise prep briefing per meeting: attendees, last correspondence context, open questions. Email it privately.`,
};

export async function runRoutine(key: string) {
  const routines = await prisma.routine.findMany({ where: { key, enabled: true }, include: { user: true } });
  for (const r of routines) {
    const assistant = await prisma.assistant.findUnique({ where: { userId: r.userId } });
    const ctx = { name: r.user.name ?? "there", personality: assistant?.personality ?? "Minimal, high-signal, brief.", assistantName: assistant?.name ?? "Assistant" };
    if (!(await spendCredits(r.userId, 25))) continue;
    try {
      // Seed the run with tool access so the model can fetch live data
      const messages: any[] = [{ role: "user", content: PROMPTS[key](ctx) + "\nUse tools to fetch real data first." }];
      let turn = await chat(messages, TOOL_DEFS);
      let guard = 0;
      const { runTool } = await import("../ai/tools");
      while (turn.tool_calls?.length && guard++ < 8) {
        messages.push(turn);
        for (const c of turn.tool_calls) {
          let res: string;
          try { res = await runTool(r.userId, c.function.name, JSON.parse(c.function.arguments || "{}")); }
          catch (e: any) { res = `Tool error: ${e.message}`; }
          messages.push({ role: "tool", tool_call_id: c.id, name: c.function.name, content: res });
        }
        turn = await chat(messages, TOOL_DEFS);
      }
      if (r.user.email && assistant) {
        await sendAsAssistant(assistant.slug!, assistant.name, r.userId, r.user.email,
          `${ctx.assistantName}: ${key.replace(/-/g, " ")}`, turn.content ?? "");
      }
      await prisma.routine.update({ where: { id: r.id }, data: { lastRunAt: new Date() } });
    } catch (e) { console.error(`routine ${key} failed for ${r.userId}`, e); }
  }
  return { ran: routines.length };
}
