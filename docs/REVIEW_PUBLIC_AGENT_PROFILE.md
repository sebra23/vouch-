# Review record — PUBLIC_AGENT_PROFILE.md v1

- **Gate:** G4/G5 design review (SOP-008)
- **Reviewer:** Toby pass via control plane (no independent human available — noted honestly)
- **Artifact reviewed:** docs/PUBLIC_AGENT_PROFILE.md (sha context: written 2026-10-26)
- **Brief:** public agent profile as TownWork wedge; reuse existing clone code; one-shot quality

## Verdict: PASS WITH CONDITIONS

### Strengths (verified)
- Reuse map is accurate: Assistant/Thread/Message/runAgent/inbound-route/sendAsAssistant all exist as claimed; "4 new files + schema delta" is plausible.
- Intent-origination rule and "agents never initiate" are stated and consistent.
- Decision-card approval and intake quarantine match the approval-matrix (A3 gating on sends).

### Defects / conditions — must fix before build
1. **Guest-email spam vector (high).** §4 step 3 sends confirmation/reply emails to an arbitrary submitted address. An attacker can use the intake form to mail-bomb third parties. Fix: never email the guest until the OWNER approves; guest views the agent reply via the magic link shown on-page after submit. Magic link expires in 7 days.
2. **GDPR gap (medium).** Visitor name/email stored in threads with no retention or deletion path. Fix: record retention rule (intake threads deleted 90 days after close; open threads reviewed at 180 days), expose "delete intake data" in Settings, include it in the privacy page before any public deploy.
3. **Tool-gating unverified (medium).** Spec assumes runAgent accepts a tool allowlist. Not yet confirmed against src/lib/agent/run.ts. Fix: verify signature before build; if absent, the allowlist gate is build item #0.
4. **Receipts wording (low).** Owner-curated JSON rendered under a "Verified work" heading overclaims. Fix: v0.1 heading = "Work receipts" with per-item "co-signed (n)" or "self-declared" chip; no aggregate trust score.
5. **Naming (low).** "townwork.com" used illustratively; no domain/trademark check done. Condition: name check before any external reference; do not publish under anything resembling Town's brand (README legal note already covers functionality-level re-implementation).

### Out of scope for this review
Market/demand validation, pricing, company-agent mode economics — not in artifact.

**Exit:** Conditions 1–3 closed → build may start. Conditions 4–5 closable at content/prep stage.

## Update 2026-10-26 — conditions disposition (spec → v1.1)
- Cond. 1 (spam vector): FIXED in spec §4 — guest never emailed pre-approval; magic link on-page, 7-day expiry.
- Cond. 2 (GDPR): FIXED in spec §4 — 90-day closed-thread deletion, 180-day open review, owner purge control, privacy policy gate.
- Cond. 3 (tool gating): CONFIRMED REQUIRED (verified 2026-10-26 in src/lib/agent/run.ts) —
  runAgent passes full TOOL_DEFS unconditionally; no allowlist param. Build item #0 is
  real and precisely scoped: add `opts.allowedTools` to runAgent, filter TOOL_DEFS
  before each `chat()` call, AND enforce the same filter inside `runTool` (defense in
  depth — model must not be able to reach unlisted tools even via crafted calls).
  Current tools to gate for intake threads: gmail_create_draft, gmail_apply_label
  (calendar_list_events / gmail_search are safe read-only and may stay).
- Cond. 4 (receipts overclaim): FIXED in spec §3/§7 — "Work receipts" heading, per-item co-signed/self-declared chips.
- Cond. 5 (naming): NAME DECIDED — "Vouch" (Sebastian, 2026-10-26). Domain/trademark
  check still required before ANY external use; until cleared, internal code and copy
  use vouch as working name only.
