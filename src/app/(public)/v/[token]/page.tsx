import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 7 * 24 * 36e5; // spec §4.3: magic links expire after 7 days

export default async function GuestViewPage({ params }: { params: { token: string } }) {
  const thread = await prisma.thread.findFirst({
    where: { publicToken: params.token, source: "intake" },
    include: { messages: { orderBy: { id: "asc" } }, user: { select: { name: true } } },
  });
  const assistant = thread ? await prisma.assistant.findUnique({ where: { userId: thread.userId } }) : null;

  // Unknown token → 404. Expired token → 410. No existence hints either way.
  if (!thread) notFound();
  if (Date.now() - thread.createdAt.getTime() > TOKEN_TTL_MS)
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-lg font-semibold">This conversation link has expired</h1>
        <p className="mt-2 text-sm text-neutral-500">Links work for 7 days. Reach out via the agent&rsquo;s public page to start a new conversation.</p>
      </main>
    );

  // Privacy: only the guest-facing slice — peer name and the agent's messages.
  const firstName = (thread.user.name ?? "the owner").split(" ")[0];
  const agentName = assistant?.name ?? "the agent";

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Your conversation with {agentName}</p>
      <h1 className="mt-1 text-lg font-semibold">For {thread.peerName}</h1>
      <p className="mt-1 text-sm text-neutral-500">{agentName} is {firstName}&rsquo;s agent. {firstName} joins only if there&rsquo;s a fit.</p>

      <div className="mt-8 space-y-4">
        {thread.messages.map((m, i) => {
          if (m.role === "user" && i === 0)
            return (
              <div key={m.id} className="text-right">
                <div className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl bg-neutral-900 px-4 py-2.5 text-left text-sm text-white">
                  {m.content.replace(/^\[intake from [^\]]+\]\n/, "")}
                </div>
                <div className="mt-1 text-xs text-neutral-400">{thread.peerName} (you)</div>
              </div>
            );
          if (m.role === "assistant")
            return (
              <div key={m.id}>
                <div className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl border bg-white px-4 py-2.5 text-sm">
                  {m.content}
                </div>
                <div className="mt-1 text-xs text-neutral-400">{agentName}</div>
              </div>
            );
          return null; // tool messages and owner-side messages are never guest-visible
        })}
      </div>

      <p className="mt-10 border-t pt-4 text-xs text-neutral-400">
        Read-only view · link expires 7 days after it was created · {agentName} never shares {firstName}&rsquo;s private data here.
      </p>
    </main>
  );
}
