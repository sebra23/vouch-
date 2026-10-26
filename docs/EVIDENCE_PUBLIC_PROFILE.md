# Evidence — public agent profile (Vouch wedge)

Status: CODE COMPLETE, VERIFICATION PENDING. Built 2026-10-26 per
BUILD_PLAN_PUBLIC_AGENT_PROFILE.md / PUBLIC_AGENT_PROFILE.md v1.2.

## Known sandbox limitations (honest record)
- Tests written (`scripts/test-public-profile.mjs`, 8 cases) but NOT executed here —
  sandbox Node predates `--experimental-strip-types`. First action below.
- App not booted in sandbox: no `npm install`, no `next build`, no live click-through.
  Type errors in new/edited files are possible and unverified.
- Mail paths (Resend) and DB paths need real env vars to verify end-to-end.

## 1. Unit tests (5 min)
```bash
node --experimental-strip-types scripts/test-public-profile.mjs
# Expected: 8/8 pass — rate limit (allow 3/block 4th, per-IP, sliding window),
# slug gen, allowlist filter (write tools excluded), defense-in-depth refusal,
# guest-view filtering (owner/tool messages hidden)
```
Paste output below:
```
[pending]
```

## 2. Build + boot (10 min)
```bash
npm install
npx prisma db push          # applies Assistant + Thread intake fields
npm run build               # type-checks all new/edited files
NEXTAUTH_SECRET=demo NEXT_PUBLIC_DEMO=1 npm run dev
```
Paste result: [pending — record any type errors and fixes here]

## 3. Demo click-through (15 min)
Boot with `NEXT_PUBLIC_DEMO=1`, open `/login` → "Explore the demo":
- [ ] `/a/column-demo` renders: avatar tile, "Open to new work" badge, tagline,
      Right-now block, 2 receipts (one "co-signed by 2", one "self-declared"),
      intake form, footer CTA
- [ ] Demo chat sidebar shows "Intake: Alex Rivera" with purple inbound badge + dot
- [ ] Opening it shows the decision card (Approve / Keep talking / Decline)
      above the conversation
- [ ] Settings → Public page: toggle on/off, fields save, live link works,
      "Delete all intake data" purges and reloads
- [ ] Onboarding (new user): step 6 "Public page" toggle off by default, optional,
      generates slug on finish

## 4. Security checks (15 min)
- [ ] `POST /api/intake` 4th request from same IP in an hour → 429
- [ ] Honeypot field filled → 200 but no thread created
- [ ] Unknown publicSlug → 404; `isPublic=false` slug → 404
- [ ] Intake thread: agent reply exists, zero drafts/labels created in Gmail
- [ ] Guest view `/v/<token>`: only intake message + agent replies visible;
      8-day-old token → 410
- [ ] Approve → exactly ONE email to peer (check Resend logs); Decline → zero
- [ ] `runTool` refuses unlisted tool even when called directly (unit covered,
      re-verify with crafted tool_call)

## 5. Regression (10 min)
- [ ] Existing chat send/receive works (owner threads full tool access)
- [ ] Inbound mail route: only owner email triggers assistant (403 otherwise)
- [ ] Routines toggle in Powers; Logs page shows intake entries (purple)
- [ ] Morning briefing email sends to owner (demo: Resend test key)

## Sign-off
- [ ] All checkboxes above checked with evidence
- [ ] Toby G5 review vs spec §8 Definition of done → Pass
- [ ] Sebastian approval for deploy (A3)
