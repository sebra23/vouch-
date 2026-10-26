import { NextResponse } from "next/server";
import { runRoutine } from "@/lib/routines/runner";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  return NextResponse.json(await runRoutine(key));
}