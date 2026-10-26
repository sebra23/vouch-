type Msg = { role: "system" | "user" | "assistant" | "tool"; content: string; tool_call_id?: string; name?: string;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] };

export async function chat(messages: Msg[], tools?: any[], model = process.env.AI_MODEL || "gpt-4o-mini") {
  const r = await fetch(`${process.env.AI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, tools, tool_choice: tools ? "auto" : undefined, temperature: 0.3 }),
  });
  if (!r.ok) throw new Error(`AI error ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()).choices[0].message as Msg;
}
