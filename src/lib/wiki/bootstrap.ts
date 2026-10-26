import { prisma } from "../db";

export async function bootstrapWiki(userId: string, name: string) {
  const pages = [
    { title: "Overview", content: `${name}'s personal hub. Built automatically from email and calendar; edit anything.` },
    { title: "Profile", content: `Communication style: match the recipient's language. Keep entries short and direct.` },
    { title: "Projects", content: "Active projects will appear here as the assistant identifies them from your mail and calendar." },
    { title: "People", content: "Key contacts and collaborators will be profiled here after onboarding completes." },
  ];
  for (const p of pages)
    await prisma.wikiPage.upsert({ where: { id: `wiki-${userId}-${p.title}` },
      update: {}, create: { id: `wiki-${userId}-${p.title}`, userId, title: p.title, content: p.content } });
}
