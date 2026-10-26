// Pure job↔candidate scoring. Dependency-free, erasable-syntax-only, unit-tested
// via scripts/test-jobs.mjs (node --experimental-strip-types).

export type JobLite = { industry: string | null; location: string | null; title: string };
export type CandidateLite = { openTo: string[]; capacity: string | null; notOpenTo: string[] };

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}

// 0–100. Deliberately simple and legible for v0.1 — a "why this job" explanation
// must be derivable from the same numbers (shown on the job detail card).
export function scoreJob(job: JobLite, c: CandidateLite): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const ind = norm(job.industry);
  const loc = norm(job.location);
  const title = norm(job.title);

  if (ind && c.openTo.some(t => norm(t).includes(ind) || ind.includes(norm(t)))) {
    score += 60; reasons.push(`matches your interest: ${job.industry}`);
  }
  if (c.openTo.some(t => title.includes(norm(t)) || norm(t).includes(title) && title)) {
    if (score < 60) { score += 40; reasons.push(`role fits: ${job.title}`); }
  }
  if (c.capacity) { score += 20; reasons.push("your availability is set"); }
  if (c.notOpenTo.some(t => title.includes(norm(t)))) {
    score = 0; reasons.push(`you said no to ${job.title}`);
    return { score, reasons };
  }
  if (loc.includes("remote") && c.capacity) {
    score += 10; reasons.push("remote role");
  }
  return { score: Math.min(score, 100), reasons };
}

// Mutual swipe → match. Both sides must be "interested".
export function isMatch(candidateState: string, employerState: string): boolean {
  return candidateState === "interested" && employerState === "interested";
}
