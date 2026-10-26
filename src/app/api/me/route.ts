import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logs";
import { makeSlug } from "@/lib/intake/guards";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session as any).userId!;
  const user = await prisma.user.findUnique({ where: { id: userId },
    select: { email: true, name: true, plan: true, preferences: true,
      assistant: { select: { name: true, personality: true, isPublic: true, publicSlug: true, tagline: true,
        openTo: true, notOpenTo: true, capacity: true, publicReceipts: true } },
      _count: { select: { threads: { where: { source: "intake", status: "awaiting_owner" } } } } } });
  const prefs = (user?.preferences ?? {}) as any;
  return NextResponse.json({ ...user, scheduling: prefs.scheduling ?? {}, pendingIntakes: user?._count?.threads ?? 0 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session as any).userId!;
  const { assistant, scheduling } = await req.json();
  let { publicProfile } = await req.json();

  const prefs: any = (await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } }))?.preferences ?? {};
  if (scheduling) prefs.scheduling = scheduling;

  const assistantUpdates: any[] = [];
  if (assistant) {
    assistantUpdates.push({ name: assistant.name, personality: assistant.personality });
    // Settings sends public-profile fields nested under `assistant` — accept both shapes.
    if (assistant.isPublic !== undefined || assistant.tagline !== undefined)
      publicProfile = {
        isPublic: assistant.isPublic, tagline: assistant.tagline, openTo: assistant.openTo,
        notOpenTo: assistant.notOpenTo, capacity: assistant.capacity, publicReceipts: assistant.publicReceipts,
      };
  }
  if (publicProfile) {
    const { isPublic, tagline, openTo, notOpenTo, capacity, publicReceipts } = publicProfile;
    assistantUpdates.push({
      isPublic: !!isPublic, tagline: tagline ?? null,
      openTo: openTo ?? [], notOpenTo: notOpenTo ?? [], capacity: capacity ?? null,
      publicReceipts: publicReceipts ?? [],
      ...(isPublic ? {} : { publicSlug: null }), // turning off clears the URL (page 404s)
    });
    // Generate the URL slug the first time the page goes live.
    if (isPublic) {
      const existing = await prisma.assistant.findUnique({ where: { userId }, select: { publicSlug: true, name: true } });
      if (!existing?.publicSlug)
        assistantUpdates.push({ publicSlug: makeSlug(existing?.name || assistant?.name || "agent") });
    }
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { preferences: prefs } }),
    ...(assistantUpdates.length
      ? [prisma.assistant.upsert({ where: { userId },
          create: { userId, ...Object.assign({}, ...assistantUpdates) },
          update: Object.assign({}, ...assistantUpdates) })]
      : []),
  ]);
  await log(userId, "system", "Settings updated");
  return NextResponse.json({ ok: true });
}
