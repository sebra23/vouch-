import { prisma } from "../db";
import { chat } from "../ai/client";
import { TOOL_DEFS, runTool } from "../ai/tools";

export type RunAgentOpts = {
  // Restrict which tools the model may call (filter + runtime enforcement in runTool).
  // Omit for full access (owner threads). Intake threads MUST pass a read-only list.
  allowedTools?: string[];
  // Replace the default owner-persona system prompt (used for intake/guest contexts).
  systemPrompt?: string;
};

export async function runAgent(userId: string, userMessage: string, threadId: string, opts: RunAgentOpts = {}) {
  const assistant = await prisma.assistant.findUnique({ where: { userId } });
  const wiki = await prisma.wikiPage.findMany({ where: { userId }, take: 5 });
  const history = await prisma.message.findMany({ where: { threadId }, orderBy: { id: "asc" }, take: 40 });

  const systemPrompt = opts.systemPrompt ?? `You are ${assistant?.name ?? "the user's assistant"} (${assistant?.slug}), a personal chief-of-staff.
Personality: ${assistant?.personality ?? "Minimal, high-signal, and brief."}
Rules: NEVER claim an email was sent — you only create drafts, which the user reviews.
You are replying to an email from your owner. Match their language. Be concise.`;

  const toolDefs = opts.allowedTools ? TOOL_DEFS.filter(t => opts.allowedTools!.includes(t.function.name)) : TOOL_DEFS;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...wiki.map(w => ({ role: "system", content: `Wiki (${w.title}): ${w.content.slice(0, 600)}` })),
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  let turn = await chat(messages, toolDefs);
  let guard = 0;
  while (turn.tool_calls?.length && guard++ < 6) {
    messages.push(turn);
    for (const call of turn.tool_calls) {
      let result: string;
      try { result = await runTool(userId, call.function.name, JSON.parse(call.function.arguments || "{}"), opts.allowedTools); }
      catch (e: any) { result = `Tool error: ${e.message}`; }
      messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: result });
    }
    turn = await chat(messages, toolDefs);
  }
  return turn.content || "(no response)";
}
