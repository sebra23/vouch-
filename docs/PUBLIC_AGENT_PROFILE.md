# Public Agent Profile — build spec (v0.1 delta)

> v1.2 — name decision (Sebastian, 2026-10-26): the product is **Vouch**. All
> "townwork.com" references below are legacy placeholder; URLs read vouch.*
> (exact TLD pending domain/trademark check — do not use externally until cleared).

Goal: a public, indexable, no-login page where anyone can meet a user's agent and
start an agent-mediated conversation. Single-player first — works with zero other
agents on the platform. This is the TownWork wedge, not a directory.

One-shot quality bar: this page is the product's front door. It must feel like a
staffed front desk, not a form.

---

## 1. Reuse map (existing code does the heavy lifting)

| Capability | Existing asset | Change needed |
|---|---|---|
| Agent identity (name, slug, personality, avatar) | `Assistant` model | add public fields (below) |
| Conversation storage | `Thread` / `Message` | add `source`, `peerName`, `peerEmail` columns |
| Agent run + tool loop | `lib/agent/run.ts` (`runAgent`) | none — intake threads call it identically |
| Intake quarantine pattern | `api/mail/inbound/route.ts` owner-check | same shape, inverted: public senders allowed into quarantined threads only |
| Outbound mail from agent address | `lib/mail/send.ts` (`sendAsAssistant`) | reuse for "your agent received a message" notice to owner |
| Activity audit | `AppLog` + Logs page | new `source: "intake"` |
| Owner approval UI pattern | chat approval flow | promote to decision-card component (shared) |
| Profile rendering pattern | wiki bootstrap pages | styling only |

New code is ~4 files + a schema delta. Everything else is composition.

## 2. Schema delta (prisma)

```prisma
model Assistant {
  // ...existing fields...
  isPublic      Boolean @default(false)
  publicSlug    String? @unique     // vouch.site/a/columnus  (null = page off; TLD pending check)
  tagline       String?             // one line, agent voice
  openTo        String[]            // ["fractional-cto","advisory"]
  notOpenTo     String[]            // ["full-time","web3"]
  capacity      String?             // free-text, owner-edited: "12h/wk from Nov 3"
  publicReceipts Json?              // [{title, detail, coSigners: n}] owner-curated for v0.1
}

model Thread {
  // ...existing fields...
  source      String  @default("owner")  // owner | email | intake
  peerName    String?
  peerEmail   String?
  status      String  @default("open")   // open | awaiting_owner | closed
  publicToken String? @unique            // unguessable URL for guest to view agent reply
}
```

No new models. Receipts are owner-curated JSON for v0.1 (real co-signed pod
receipts come later — see §7).

## 3. The page — layout & copy

Route: `/a/[publicSlug]` (no auth). Server-rendered, `generateMetadata` for OG.
Design rule: one column, generous whitespace, agent speaks in first person.

```
┌──────────────────────────────────────────────┐
│  [avatar 96px]                               │
│  Columnus                        ● Available │
│  Agent for Sebastian L.                      │
│  "Direct, precise, and always observant."    │
│                                              │
│  ── Right now ──────────────────────────     │
│  ▸ Capacity:   12h/wk from Nov 3             │
│  ▸ Open to:   fractional CTO · fintech ·     │
│                advisory                      │
│  ▸ Not:       full-time roles                │
│                                              │
│  ── Work receipts ───────────────────────    │
│  ✓ Closed 14 DB migrations — Q3              │
│    co-signed by 2 collaborators              │
│  ✓ GTM launch for [project]                  │
│    co-signed by 1 collaborator               │
│  (unverified lines render gray, with         │
│   "self-reported" chip — never hidden)       │
│                                              │
│  ── Work with Sebastian ────────────────     │
│  ┌────────────────────────────────────────┐  │
│  │ Describe what you need…                │  │
│  └────────────────────────────────────────┘  │
│  [ Your name ]  [ Your email ]               │
│  → Columnus replies here within a day.       │
│    Sebastian only sees it if it's a fit.     │
│                                              │
│  Powered by [logo] — your agent has a page   │
│  like this.  [Get one]                       │
└──────────────────────────────────────────────┘
```

### Appeal details (the one-shot stuff)
- Avatar + name carry the personality; tagline is the agent's voice, not a bio.
- "● Available" badge derives from `capacity` presence — no fake scarcity, no counters.
- The footer CTA converts visitors into users: every public page is an ad.
- OG image: agent avatar + name + tagline on brand background (generate statically).
- Empty states matter: no receipts → section shows "No verified work yet —
  Columnus is new." Never hides the section.

## 4. Intake flow (agent-mediated, quarantined)

1. Visitor submits name + email + message → `POST /api/intake` (rate-limited:
   3/IP/hour, honeypot field, 1k char cap).
2. Server creates `Thread { source: "intake", peerName, peerEmail, status: "awaiting_owner" }`,
   seeds messages: `[intake] <text>`, then runs `runAgent` with a locked system prompt:
   *"You are <name>, gatekeeper for <owner>. Engage genuinely, ask clarifying
   questions about scope/timing/budget, but make NO commitments and never imply
   the owner has agreed to anything."*
3. Agent's replies are stored. The guest views the conversation via an
   unguessable `publicToken` magic link shown ON-PAGE after submit (read-only,
   no login, expires in 7 days). The guest is NEVER emailed before the owner
   approves — emailing arbitrary submitted addresses would be a spam vector.
   First guest email happens only at step 5 (intro).
4. Owner notification = one email from the agent: summary + one decision card
   link (`/chat/[id]`) — **Approve intro / Keep talking / Decline**. This is the
   same approval pattern as chat sends; the decision-card component gets
   extracted and shared (used here and in future notification tiers).
5. On approve → thread becomes a normal owner thread; peer gets an email from
   the agent's address introducing both. On decline → agent sends a polite
   closure to peer. All logged (`AppLog source: "intake"`).

Security rules (hard requirements):
- Intake threads can never trigger send tools. Tool gating in `runAgent` call:
  pass an allowlist excluding outbound mail/scheduling writes for `source: "intake"`.
- The public page exposes only the whitelisted fields above. Email, calendar,
  wiki — never.
- `isPublic=false` or missing `publicSlug` → 404 (page does not exist, no hint).
- **Visitor data (GDPR):** intake threads auto-delete 90 days after close;
  open threads reviewed at 180 days; owner has a "delete all intake data"
  control in Settings. Privacy policy must state this before any public deploy.
- Tool gating (build item #0, confirmed against code): `runAgent` currently passes
  full TOOL_DEFS unconditionally. Add `opts.allowedTools` to runAgent, filter
  TOOL_DEFS before each `chat()` call, and enforce the same filter inside `runTool`
  (defense in depth). Intake threads get read-only tools (calendar_list_events,
  gmail_search); gmail_create_draft and gmail_apply_label are excluded.
- Naming: product is **Vouch** (decided). Run domain/trademark check before any
  external reference; never publish under anything resembling Town's brand.
  Internal code/copy may use "vouch" as working name only.

## 5. Owner-side additions (inside existing app)

- **Onboarding step 6.5** (after persona confirm): "Give your agent a public
  page?" → toggle + tagline + open-to chips. Off by default. Skippable.
- **Settings → Public page**: live preview link, toggle, edit fields, per-field
  visibility, view-intake queue ("Awaiting you: 2 conversations").
- Chat sidebar shows intake threads with a distinct badge (purple `inbound`).

## 6. Explicitly out of v0.1
Directory/browsing, agent-to-agent API negotiation, real pod receipts, payments,
custom domains. The magic-link guest view is intentionally read-only.

## 7. After-launch path (recorded, not built)
`publicReceipts` JSON → real `Receipt` model minted when a pod/project closes,
co-signed via both parties' decision cards. That's the trust graph seed.

## 8. Definition of done (Monday gate)
- [ ] `/a/[publicSlug]` renders for public agents, 404 otherwise, OG meta present
- [ ] Intake creates quarantined thread, agent replies, guest magic-link works
- [ ] Owner decision card: approve keeps thread + notifies peer; decline closes politely
- [ ] Intake threads cannot invoke send/scheduling tools (test asserts allowlist)
- [ ] Rate limit + honeypot verified
- [ ] Onboarding 6.5 + Settings page live; demo user has a public page seeded
- [ ] Toby review: Pass before deploy
