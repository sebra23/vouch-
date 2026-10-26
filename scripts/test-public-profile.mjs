// Tests for the public agent profile intake guards.
// Run: node --experimental-strip-types scripts/test-public-profile.mjs
// Dependency-free: imports only the pure helpers from src/lib/intake/guards.ts.

import { test } from "node:test";
import assert from "node:assert/strict";
import { rateOk, makeSlug, filterTools, toolPermitted, guestVisible } from "../src/lib/intake/guards.ts";

const DEFS = [
  { function: { name: "calendar_list_events" } },
  { function: { name: "gmail_search" } },
  { function: { name: "gmail_create_draft" } },
  { function: { name: "gmail_apply_label" } },
];
const READ_ONLY = ["calendar_list_events", "gmail_search"];

test("rate limit: allows 3 per window then blocks", () => {
  const hits = new Map();
  assert.equal(rateOk(hits, "1.2.3.4", 1000), true);
  assert.equal(rateOk(hits, "1.2.3.4", 2000), true);
  assert.equal(rateOk(hits, "1.2.3.4", 3000), true);
  assert.equal(rateOk(hits, "1.2.3.4", 4000), false); // 4th within window
});

test("rate limit: separate IPs tracked separately", () => {
  const hits = new Map();
  for (let i = 0; i < 3; i++) rateOk(hits, "a", i);
  assert.equal(rateOk(hits, "b", 10), true);
  assert.equal(rateOk(hits, "a", 10), false);
});

test("rate limit: window slides", () => {
  const hits = new Map();
  for (let i = 0; i < 3; i++) rateOk(hits, "ip", i);
  assert.equal(rateOk(hits, "ip", 36e5 + 1), true); // first hit expired out
});

test("makeSlug: slugifies and appends suffix", () => {
  assert.equal(makeSlug("Columnus", () => 0.12345), "columnus-3t0");
  assert.equal(makeSlug("  Weird  Name!! ", () => 0.999), "weird-name-2ps");
  assert.equal(makeSlug("", () => 0.5), "agent-gzz");
  assert.ok(makeSlug("x".repeat(50)).length <= 29, "slug length capped");
});

test("filterTools: read-only intake list excludes write tools", () => {
  const filtered = filterTools(DEFS, READ_ONLY);
  assert.deepEqual(filtered.map(t => t.function.name), READ_ONLY);
  assert.ok(!filtered.some(t => t.function.name === "gmail_create_draft"), "draft tool must be excluded");
  assert.ok(!filtered.some(t => t.function.name === "gmail_apply_label"), "label tool must be excluded");
});

test("filterTools: no allowlist = full access (owner threads unchanged)", () => {
  assert.equal(filterTools(DEFS).length, DEFS.length);
});

test("toolPermitted: defense-in-depth refusal for unlisted tools", () => {
  assert.equal(toolPermitted("gmail_create_draft", READ_ONLY), false);
  assert.equal(toolPermitted("gmail_search", READ_ONLY), true);
  assert.equal(toolPermitted("anything"), true); // no allowlist = permitted
});

test("guestVisible: only intake message + assistant replies render", () => {
  assert.equal(guestVisible("user", 0), true);          // the intake message
  assert.equal(guestVisible("assistant", 1), true);     // agent replies
  assert.equal(guestVisible("user", 2), false);         // owner chat replies — never guest-visible
  assert.equal(guestVisible("tool", 1), false);         // tool noise — never guest-visible
});
