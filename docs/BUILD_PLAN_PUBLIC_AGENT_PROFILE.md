# Build plan — Vouch public agent profile (v1.2 spec)

Sequenced for one builder, smallest dependency path. Estimates in dev-days (dd).
Gate rule: no task starts before its dependencies' tests pass. Release blocked
until Toby G5 review passes (spec §8).

## Phase 0 — Foundation (1 dd)
**T0.1 Tool allowlist gate** — *unblocks everything*
- `runAgent(userId, msg, threadId, opts?: { allowedTools?: string[], systemPrompt?: string })`
- Filter TOOL_DEFS before every `chat()` call; enforce same filter inside `runTool`.
- Read-only default set: `calendar_list_events`, `gmail_search`. Write tools
  (`gmail_create_draft`, `gmail_apply_label`) only when allowlist includes them.
- `systemPrompt` override replaces the owner-email persona prompt for intake threads.
- **Tests:** unlisted tool call from model returns "not permitted"; listed tools execute.
- DoD: existing chat + inbound routes still green; intake call passes allowlist only.

## Phase 1 — Data (0.5 dd)
**T1.1 Schema migration**
- Assistant: `isPublic`, `publicSlug? @unique`, `tagline?`, `openTo String[]`,
  `notOpenTo String[]`, `capacity?`, `publicReceipts Json?`
- Thread: `source @default("owner")`, `peerName?`, `peerEmail?`, `status @default("open")`,
  `publicToken? @unique`
- `npx prisma db push` + migration note in repo.

## Phase 2 — Public surface (1.5 dd)
**T2.1 Public page `/a/[publicSlug]`**
- Server-rendered; 404 if `isPublic=false`/slug missing (no existence hints).
- Layout per spec §3: avatar/name/availability badge, tagline, Right-now block
  (capacity/openTo/notOpenTo), Work receipts with per-item co-signed/self-declared
  chips, intake form, footer CTA ("your agent has a page like this → Get one").
- `generateMetadata` + static OG image (avatar + name + tagline).
- Empty states: no capacity → badge "Not taking new work"; no receipts →
  "No work receipts yet — Columnus is new." Sections never disappear.
- Form fields: message (1k cap), name, email, honeypot.

**T2.2 Intake API `POST /api/intake`**
- Rate limit 3/IP/hour (in-memory counter fine for v0.1); honeypot reject silent 200.
- Create Thread{source:"intake", status:"awaiting_owner", peerName, peerEmail,
  publicToken: crypto.randomUUID()}, seed `[intake] <text>`.
- Run agent via T0.1 with: allowlist = read-only; locked gatekeeper system prompt
  (spec §4 step 2). Store assistant reply as Message.
- Log `AppLog{source:"intake"}`.
- Response: `{ tokenUrl }` — NO email sent to guest (spec §4.3).

**T2.3 Guest view `/v/[publicToken]`** (0.5 dd)
- Read-only conversation render (peer + agent messages only), no owner content
  leaks. 404 on unknown/expired token (7-day expiry: 410 Gone after).

## Phase 3 — Owner loop (1.5 dd)
**T3.1 Decision card** (extract shared component from chat approval pattern)
- Intake thread in owner chat renders card: peer summary, agent summary,
  thread preview link, buttons [Approve intro] [Keep talking] [Decline].
- Approve → status "open", thread becomes normal owner thread, agent sends intro
  email to peer via `sendAsAssistant` (first and only guest email).
- Decline → agent generates polite closure, thread status "closed", guest view
  shows closure, peer NOT emailed (view-only).
- Keep talking → agent continues gatekeeper conversation; guest refreshes token view.
- Owner notification email: one per intake batch, links to decision card.
- Sidebar: intake threads get purple `inbound` badge (matches Logs source color).

**T3.2 Settings → Public page** (0.5 dd)
- Toggle `isPublic`, edit tagline/capacity/openTo/notOpenTo/receipts, live preview
  link, intake queue list ("Awaiting you: n"), "Delete all intake data" purge button
  (hard-deletes intake threads + peer fields, logs the purge).

## Phase 4 — Onboarding + seed (0.5 dd)
**T4.1 Onboarding step 6.5** — after persona confirm: "Give Columnus a public
page?" toggle + tagline + openTo chips. Off by default, skippable. Sets
`isPublic` + generates `publicSlug` (slugified agent name + short hash).
**T4.2 Demo seed** — demo user gets a public page with sample receipts + one
pending intake thread so the decision card is visible in demo mode.

## Phase 5 — Verification (0.5 dd)
- **Tests (new):** allowlist enforcement (T0.1); 404 behavior for private/missing
  slugs; rate limit triggers at 4th request; honeypot swallowed; token expiry 410;
  intake thread cannot create drafts/labels (assert no draft rows); approve path
  sends exactly one guest email; decline sends zero; purge deletes peer data.
- **Regression:** existing suite + boot demo, click through onboarding → chat →
  routines toggle → logs.
- **Evidence file:** `docs/EVIDENCE_PUBLIC_PROFILE.md` — test output, demo
  screenshots (page w/ receipts, intake form, guest view, decision card),
  API curl logs.

## Phase 6 — Release gate (0.5 dd, blocked on Sebastian)
- Toby G5 review vs spec §8 DoD checklist.
- Deploy checklist additions: naming check cleared (Vouch domain/trademark),
  privacy policy page live (GDPR retention statement from spec §4), OG image
  generated, `NEXT_PUBLIC_DEMO=0`.

## Totals & risks
- **~6.5 dd** one builder; T2.1/T2.2 parallelizable after Phase 1 (~5.5 dd critical path).
- Top risks: (1) OG image generation quality — fallback: text-only OG card;
  (2) rate limiting in-memory resets on serverless cold start — acceptable for
  v0.1, note in EVIDENCE; (3) `sendAsAssistant` deliverability to arbitrary
  guest addresses — verify Resend domain auth in staging before Phase 3 test.
- Rollback: feature-flagged by `isPublic` default-off; revert = one migration + flag.
