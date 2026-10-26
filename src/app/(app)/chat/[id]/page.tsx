import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import ChatBox from "../chat-box";
import IntakeCard from "../intake-card";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const thread = await prisma.thread.findFirst({ where: { id: params.id, userId: (session as any).userId! },
    include: { messages: true } });
  if (!thread) return <div className="p-8 text-sm text-neutral-500">Thread not found.</div>;
  return (
    <div className="flex h-full flex-1 flex-col">
      {thread.source === "intake" && thread.status === "awaiting_owner" && (
        <div className="px-6 pt-4">
          <IntakeCard threadId={thread.id} peerName={thread.peerName ?? "Unknown"} peerEmail={thread.peerEmail ?? ""} />
        </div>
      )}
      <ChatBox threadId={thread.id} initial={thread.messages.map(m => ({ role: m.role, content: m.content }))} />
    </div>
  );
}