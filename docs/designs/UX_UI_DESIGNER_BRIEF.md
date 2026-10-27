# Vouch — brief for UX/UI designer

Prepared 2026-10-27. Everything below reflects decisions already made; the design
task is execution, not strategy. Challenge the decisions only if you find a
falsifiable problem — the strategy has been stress-tested.

## 1. What Vouch is

An agentic jobs platform. Candidates and employers don't browse, apply, or cold-
message — their AI assistants match them. Humans make only the decisions only
humans can make: yes, no, and signing the deal.

**The one-sentence frame:** LinkedIn says "here's everyone, go hunt." Vouch says
"work finds you. You just say yes or no."

Live product: https://vouchi.netlify.app (demo mode: explore without login).

## 2. Users and their emotional states

**Candidate (fractional tech leaders first: CTO, VP Eng, head of product).**
Fears: silence after applying, rejection visibility, their current employer
finding out, recruiter spam. Wants: to be chosen without begging; momentum
without exposure. → *The design must make "currently employed and looking" feel
safe.* The sentence "invisible to your employer" appears in the header of every
candidate-facing list.

**Employer (founders at post-seed startups).** Fears: 500 unqualified
applicants, ghosting, slow hires, bad hires. Wants: a shortlist of 5 who
actually fit. → *Every pass is invisible to the candidate — state this wherever
passing occurs. No one is ever publicly rejected.*

Both sides fear wasting time. Every screen must answer "why is this worth my
thumb?" with a concrete, legible reason.

## 3. Hard rules (violating these = redesign, not discussion)

1. **No engagement addiction mechanics.** No infinite scroll, no follower
   counts, no view counts, no "someone searched you," no streaks. Lists end;
   empty states say when the next batch arrives ("new matches land as roles
   open").
2. **One primary action per screen.** Amber is reserved for that action and
   that action only (see §5).
3. **A swipe pass is always invisible.** Candidates never see a no; employers
   never see their own passes announced.
4. **Every notification is an event, not content.** Match, reply, payment,
   receipt. If nothing real happened, the user hears nothing. Notifications are
   batched to a daily digest plus red-tier "needs you" cards.
5. **No raw candidate↔employer chat before match.** Pre-match, all contact is
   agent-mediated; post-match, each party talks with their own assistant in
   their own thread.
6. **Verified vs. self-declared is always visually distinct.** Green chip =
   confirmed by the other party. Neutral chip = self-declared. Never blend.
7. **GDPR/EU AI Act posture:** no fully automated rejection of a human; every
   pass/decline is a human tap on an agent's recommendation; AI involvement is
   disclosed; users can request human review.

## 4. Product flows (the three loops)

**A. Candidate:** set what you want (industry · role · area · availability) →
suggested jobs (swipe) → mutual match → assistants arrange a time slot →
contract → payment milestones → **receipt minted at completion** → agent
queues the next gig at a higher rate band.

**B. Employer:** post job ad (plain words, no HR jargon) → see interested,
pre-declared candidates sorted by fit → swipe → mutual match → contract →
milestone payments → co-sign receipt → replacement guarantee (30 days).

**C. Reach-out (candidate → company):** candidate sets criteria → agent finds
companies + right person → drafts a capped (5/week) tailored intro → lands as a
reviewable decision card on the employer side → approve = intro.

## 5. Design system (already extracted — use it, extend it, don't replace it)

Full spec: `docs/designs/town_reference_design_system.md`.

- Surfaces: warm cream `#F7F4EE` background, white cards, hairline borders
  (`#E7E3DA`). **No drop shadows — flat and calm.**
- Ink: `#1A1A1C` primary, `#6E6E73` secondary, `#9C9CA1` tertiary.
- **One accent:** amber `#F5A524`, reserved for the single primary action per
  screen + "needs you" emphasis (1px amber border, never a bigger shadow).
- Functional: success `#2E9E6B` (verified, matched, money released only);
  danger `#D94848` (rare); purple `#8B7CF6` (inbound/reached-out badge only).
- Type: Inter, weights 400/500/600 only. Sentence case everywhere. Numbers in
  tabular figures (rates, counts).
- Grid: 4pt, single column, max content width 560–640px. Motion 150–200ms
  ease-out; swipe cards spring. No parallax, no confetti — matches are
  celebrated with information, not animation.
- Dark mode: full parity, graphite `#1F1F22` base. Not an afterthought.

## 6. Screen inventory

**Public (no login):** landing · public agent page (`/a/[slug]`) · public job ad
pages (SEO magnets) — all live, need polish pass.

**Candidate:** Jobs for you (swipe stack) · job detail (facts + "why we picked
this" + "what we'll tell them") · Matches · match thread (chat with own
assistant) · track record (verified graph + rate band) · reach-out composer ·
assistant activity log · settings (what you want, visibility, payments, data).

**Employer:** People-for-your-roles stack · job ad manager · candidate card ·
inbox of reached-out cards · match threads · contract & payments · company
page.

**Shared:** week-in-motion (Monday digest: 3 stats, momentum line, assistant's
work) · notifications center · engagement detail (milestone/payment state) ·
receipt detail.

Current implementation status: public pages + marketplace core are built in
Next.js/Tailwind; the visual layer is mid-reskin to the design system above.

## 7. Copy tone

Plain, warm, second person. No platform-speak ("declaration" → "what you're
looking for"; "receipt" stays — it's honest; "prompt" → "reach out"). Agents
speak in first person with a one-line personality. Humor is allowed in empty
states, never in money or rejection moments.

Reference copy that is already decided and must not drift:
- "invisible to your employer"
- "if you pass, they never know"
- "the agent replies today. seb only appears if it's a fit."
- "worth 15 minutes?" (reach-out drafts)

## 8. What we want from you

1. **Audit the live screens** against §3–§6 and return a defect list ranked by
   severity (blocker / confusing / polish).
2. **Design the three highest-friction screens to final quality** as a
   reference standard: Jobs-for-you stack, match moment, contract & payments.
3. **Empty/edge states** for every list (no matches yet, no jobs yet, no
   receipts yet, pending employer response) — these carry the product's
   personality.
4. **The week-in-motion card** — our replacement for the feed; it must earn a
   Monday open without a single engagement trick.
5. Accessibility: WCAG AA contrast on all token pairs; every action reachable
   by keyboard; motion respects reduced-motion.

Deliverables: Figma (or equivalent) + a written rationale per screen that maps
every element back to a rule in §3. Anything in your designs that breaks a
§3 rule needs the rule cited as an explicit, argued exception.

## 9. Context on what this product refuses to be

We are not building a feed. We are not maximizing time-on-site — a user who
opens twice a week and books an interview beats a daily scroller. We make money
when people get hired and stay on-platform for contracts and payments, not when
they watch. If a design decision would make LinkedIn's growth team proud, it's
probably wrong for Vouch.
