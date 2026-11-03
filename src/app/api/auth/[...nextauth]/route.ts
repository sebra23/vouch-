import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// --- Diagnostic layer (temporary): capture auth errors into AppLog ---
async function capture(context: string, err: any) {
  try {
    const sys = await prisma.user.upsert({
      where: { email: "auth-log@ari.local" },
      update: {},
      create: { email: "auth-log@ari.local", name: "AuthLog", onboardingDone: true },
    });
    const detail =
      (err?.stack as string | undefined) ??
      JSON.stringify({ message: err?.message, code: err?.code, meta: err?.meta, name: err?.name });
    await prisma.appLog.create({
      data: { userId: sys.id, source: "system", message: `[auth] ${context}: ${detail}`.slice(0, 1900) },
    });
    // Second row: the REASON lives at the tail of Prisma validation messages
    if (typeof err?.message === "string" && err.message.length > 400) {
      await prisma.appLog.create({
        data: { userId: sys.id, source: "system",
          message: `[auth-reason] ${context}: ${err.message.slice(-800)}` },
      });
    }
  } catch { /* diagnostics must never break auth */ }
}

// Wrap every adapter method: any exception is captured with full Prisma metadata,
// then re-thrown so NextAuth's flow behaves identically.
const baseAdapter = PrismaAdapter(prisma) as Record<string, any>;
const instrumentedAdapter = new Proxy(baseAdapter, {
  get(target, prop) {
    const value = target[prop as string];
    if (typeof value !== "function") return value;
    return async (...args: any[]) => {
      try {
        // createUser dedupe: return the existing same-email user instead of
        // violating the unique constraint (prevents orphan rows on retries).
        if (prop === "createUser" && args[0]?.email) {
          const existing = await prisma.user.findUnique({ where: { email: args[0].email } });
          if (existing) return existing;
        }
        return await (value as Function).apply(target, args);
      } catch (e) {
        await capture(`adapter.${String(prop)}`, e);
        throw e;
      }
    };
  },
});

const handler = NextAuth({
  ...authOptions,
  adapter: instrumentedAdapter as any,
  logger: {
    error: (code, metadata) => { console.error(code, metadata); void capture(String(code), metadata); },
    warn: (code) => { console.warn(code); },
  },
});

export { handler as GET, handler as POST };
