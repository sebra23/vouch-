# Vouch UI implementation prompt (combine design system + PRD)

Use in any React/Tailwind implementation session. Reflects
town_reference_design_system.md + the product spec (PUBLIC_AGENT_PROFILE.md,
BUILD_PLAN, jobs marketplace architecture).

---

You are implementing the UI for Vouch, an agentic jobs platform. Aesthetic:
premium calm — warm cream surfaces, deep graphite text/primary actions, single
amber accent (#F5A524) reserved for THE primary action of each screen. Flat
cards with hairline borders, no drop shadows. Inter, weights 400/500/600 only.
Sentence case everywhere. One column, max-w-xl (≈560–640px). Animations 150–200ms
ease-out only.

## Product frame (all copy follows this)
- Candidates: "work finds you. you just say yes or no." Job hunt is private —
  the phrase "invisible to your employer" appears in the header of every
  candidate-facing list.
- Employers: "only people who confirmed they're open."
- A swipe pass is invisible to the other side — state it wherever passes occur.
- Matches are events with momentum: time slots already held by the assistants.

## Screens to implement (priority order)
1. **Jobs for you** — card stack, each card: fit chip ("strong match"), title ·
   company, rate · commitment · location, one honest line from the ad, two
   buttons: primary "I'm interested" / secondary "Not for me". Header: greeting
   + "invisible to your employer".
2. **Job detail** — facts block (pay/term/team), "why we picked this for you"
   (plain-language reasons), "what we'll tell them about you" (agent's intro
   draft). Same two actions.
3. **Hiring (employer)** — job ad creation form (plain fields, no HR jargon:
   "what the work is, honestly"), plus list of interested people as cards with
   verified-client chips and "I'm interested / Pass — invisible".
4. **Matches** — mutual-yes list, both perspectives; each row links to the
   agent thread ("your assistant is coordinating — open the thread").
5. **Match thread** — chat with own assistant about the match; assistant holds
   time slots; confirm/counter buttons render as decision cards (amber border,
   not shadow).
6. **Track record** — verified engagements list: title + "confirmed by {name}"
   chip (success tint) vs "self-declared" (neutral tint); simple growth bars;
   rate band chip.
7. **Public agent page** (`/a/[slug]`) — already built; reskin ONLY: cream bg,
   graphite primary button, amber for the single intake CTA, receipts with
   verified/self-declared chips.
8. **Week in motion** — 3 stat cards (matches/conversations/calls), momentum
   line (neutral stroke, endpoint dot in success), "your assistant also" list.

## Hard rules
- No follower counts, no view counts, no "someone searched you" anywhere.
- No infinite scroll: lists end; empty states say when the next batch arrives
  ("new matches land as roles open").
- Success color = verified/money only; amber = the one action; purple = inbound
  only. Never decorate.
- Dark mode full parity (graphite #1F1F22 base).

Deliver components under `src/components/v2/` beside the existing Tailwind app;
do not refactor existing pages beyond the reskin in item 7.
