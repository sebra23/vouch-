// Run: node --experimental-strip-types scripts/test-jobs.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreJob, isMatch } from "../src/lib/match/score.ts";

const CAND = { openTo: ["fintech", "fractional-cto"], capacity: "12h/wk", notOpenTo: ["full-time"] };

test("industry match scores high with reason", () => {
  const r = scoreJob({ industry: "fintech", location: "remote EU", title: "Fractional CTO" }, CAND);
  assert.ok(r.score >= 80, `expected >=80, got ${r.score}`);
  assert.ok(r.reasons.some(x => x.includes("fintech")));
});

test("no overlap scores low", () => {
  const r = scoreJob({ industry: "healthcare", location: "onsite vienna", title: "Nurse" }, CAND);
  assert.ok(r.score <= 20);
});

test("notOpenTo kills the match even on industry fit", () => {
  const r = scoreJob({ industry: "fintech", location: null, title: "full-time CTO" },
    { ...CAND, notOpenTo: ["full-time", "cto"] });
  assert.equal(r.score, 0);
});

test("remote bonus applies for active candidates on remote roles", () => {
  const a = scoreJob({ industry: "fintech", location: "remote EU", title: "CTO" }, CAND);
  const b = scoreJob({ industry: "fintech", location: "berlin onsite", title: "CTO" }, CAND);
  const noCap = scoreJob({ industry: "fintech", location: "remote EU", title: "CTO" }, { ...CAND, capacity: null });
  assert.ok(a.score > b.score);
  assert.ok(a.score > noCap.score);
});

test("mutual interest is the only match", () => {
  assert.equal(isMatch("interested", "interested"), true);
  assert.equal(isMatch("interested", "none"), false);
  assert.equal(isMatch("passed", "interested"), false);
  assert.equal(isMatch("interested", "passed"), false);
});
