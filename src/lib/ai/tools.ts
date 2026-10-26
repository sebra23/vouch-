import { getValidAccessToken } from "../tokens";

export const TOOL_DEFS = [
  { type: "function", function: { name: "calendar_list_events",
    description: "List upcoming calendar events for the user.",
    parameters: { type: "object", properties: { days: { type: "number", description: "days ahead", default: 7 } }, required: [] } } },
  { type: "function", function: { name: "gmail_search",
    description: "Search the user's Gmail. Returns matching messages (read-only).",
    parameters: { type: "object", properties: { q: { type: "string" }, max: { type: "number", default: 10 } }, required: ["q"] } } },
  { type: "function", function: { name: "gmail_create_draft",
    description: "Create a DRAFT reply (never sends). User approves/sends manually in Gmail.",
    parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" },
      threadId: { type: "string" } }, required: ["to", "subject", "body"] } } },
  { type: "function", function: { name: "gmail_apply_label",
    description: "Apply an existing or new Gmail label to a thread.",
    parameters: { type: "object", properties: { threadId: { type: "string" }, label: { type: "string" } }, required: ["threadId", "label"] } } },
];

async function gapi(userId: string, path: string, init: RequestInit = {}) {
  const t = await getValidAccessToken(userId, "google");
  if (!t) throw new Error("Google account not connected");
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`,
    { ...init, headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`gmail ${path}: ${r.status} ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

// Defense in depth: even if a model emits a tool call for a tool that was not
// offered in TOOL_DEFS, runTool refuses it when an allowlist is in force.
export async function runTool(userId: string, name: string, args: any, allowedTools?: string[]) {
  if (allowedTools && !allowedTools.includes(name))
    return `Tool "${name}" is not permitted in this context.`;
  if (name === "calendar_list_events") {
    const t = await getValidAccessToken(userId, "google");
    if (!t) throw new Error("Google account not connected");
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", new Date().toISOString());
    url.searchParams.set("timeMax", new Date(Date.now() + (args.days ?? 7) * 864e5).toISOString());
    url.searchParams.set("maxResults", "20"); url.searchParams.set("singleEvents", "true"); url.searchParams.set("orderBy", "startTime");
    const r = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) throw new Error(`calendar: ${r.status}`);
    const data = await r.json();
    return (data.items ?? []).map((e: any) => `${e.start?.dateTime ?? e.start?.date} — ${e.summary} (${e.attendees?.length ?? 0} attendees)`).join("\n") || "No upcoming events.";
  }
  if (name === "gmail_search") {
    const list = await gapi(userId, `/messages?q=${encodeURIComponent(args.q)}&maxResults=${args.max ?? 10}`);
    const msgs = await Promise.all((list.messages ?? []).slice(0, 10).map(async (m: any) => {
      const full = await gapi(userId, `/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`);
      const h = (n: string) => full.payload?.headers?.find((x: any) => x.name === n)?.value ?? "";
      return `${h("Date")} | ${h("From")} | ${h("Subject")} [id:${m.id}]`;
    }));
    return msgs.join("\n") || "No matches.";
  }
  if (name === "gmail_create_draft") {
    const raw = Buffer.from(`To: ${args.to}\r\nSubject: ${args.subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${args.body}`).toString("base64url");
    await gapi(userId, "/drafts", { method: "POST", body: JSON.stringify({ message: { raw, threadId: args.threadId } }) });
    return `Draft created for ${args.to}. It has NOT been sent — the user reviews it in Gmail first.`;
  }
  if (name === "gmail_apply_label") {
    const labels = await gapi(userId, "/labels");
    let label = labels.labels?.find((l: any) => l.name === args.label);
    if (!label) label = await gapi(userId, "/labels", { method: "POST", body: JSON.stringify({ name: args.label }) });
    await gapi(userId, `/threads/${args.threadId}/modify`, { method: "POST", body: JSON.stringify({ addLabelIds: [label.id] }) });
    return `Label "${args.label}" applied.`;
  }
  return `Unknown tool ${name}`;
}
