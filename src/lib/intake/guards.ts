// Pure helpers for the public-intake flow. Kept dependency-free and
// erasable-syntax-only so scripts/test-public-profile.mjs can import them
// with `node --experimental-strip-types` (no build step, no deps).

// --- Rate limiting (v0.1: in-memory; resets on serverless cold start) ---
export type HitMap = Map<string, number[]>;

export function rateOk(hits: HitMap, ip: string, now = Date.now(), limit = 3, windowMs = 36e5): boolean {
  const arr = (hits.get(ip) ?? []).filter(t => now - t < windowMs);
  if (arr.length >= limit) { hits.set(ip, arr); return false; }
  arr.push(now); hits.set(ip, arr); return true;
}

// --- Public slug generation ---
export function makeSlug(name: string, rand: () => number = Math.random): string {
  const base = (name || "agent").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "agent";
  return `${base}-${rand().toString(36).slice(2, 6)}`;
}

// --- Tool allowlist filtering (mirrors runAgent/runTool gating) ---
export function filterTools<T extends { function: { name: string } }>(defs: T[], allowedTools?: string[]): T[] {
  return allowedTools ? defs.filter(t => allowedTools.includes(t.function.name)) : defs;
}

export function toolPermitted(name: string, allowedTools?: string[]): boolean {
  return !allowedTools || allowedTools.includes(name);
}

// --- Guest-view message filtering: only the intake message + assistant replies ---
export function guestVisible(role: string, index: number): boolean {
  return (role === "user" && index === 0) || role === "assistant";
}
