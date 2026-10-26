# Vouch design system — extracted from Town reference (ui-blueprint skill)

Source: Town onboarding + app screenshots (2026-10-26 batch, /mnt/agents/temp/).
Design intent: a "chief of staff" product — calm, premium, human. Warm neutrals
and one confident accent. Zero decoration that doesn't serve the decision at hand.

## Color palette

### Primary
- Deep graphite — #1F1F22 (primary brand surface: headers, primary buttons, dark mode base)
- Warm cream — #F7F4EE (app background; calm, paper-like)

### Accent (sparingly — one accent only)
- Amber — #F5A524 (primary CTA, active states, the "human warmth" signal)
- Amber soft — #FDF3E0 (highlighted/selected backgrounds, badges)

### Functional
- Success — #2E9E6B (verified receipts, "matched", money released)
- Danger — #D94848 (errors, destructive; used rarely)
- Info/purple — #8B7CF6 (inbound/intake badge — reserved for "someone reached out")

### Neutrals & backgrounds
- Card white — #FFFFFF on cream; on dark: #2A2A2E
- Text primary — #1A1A1C / on dark #F2F1EC
- Text secondary — #6E6E73 / on dark #A8A8AD
- Text tertiary — #9C9CA1 (timestamps, meta)
- Hairline border — #E7E3DA (light) / #3A3A3F (dark)

## Typography

Font: Inter (web/system fallback SF Pro). Weights 400/500/600 only — no bold headlines.
- Screen title: 22px/28, 600, -0.3px
- Card title: 16px/22, 500
- Body: 15px/22, 400
- Caption/meta: 13px/18, 400, secondary color
- Micro (badges, timestamps): 12px/16, 500, tertiary color

Voice rule: sentence case everywhere; numbers in tabular lining figures for rates.

## Components

### Buttons
- Primary: graphite bg (#1F1F22), white text, height 44, radius 10 — amber bg ONLY for the single main action per screen
- Secondary: 1px hairline border, graphite text, transparent bg
- Tertiary: text-only, secondary color

### Cards
- White on cream, radius 12, padding 16, hairline border (no shadows — flat, calm)
- "Needs you" emphasis: 1px amber border, not a bigger shadow

### Chips / badges
- Radius full, 12px medium text: verified (success tint), inbound (purple tint), self-declared (neutral tint)

### Inputs
- Height 48, radius 10, hairline border, active state = amber border 1.5px

### Toggle
- iOS-style: amber when on, graphite track when off (seen in routines)

## Spacing
4 / 8 / 12 / 16 / 24 / 32 / 48 — 4pt grid. Max content width 560–640px (single-column, decision-focused).

## Motion
- 150–200ms ease-out for state changes; 300ms for screen transitions
- Swipe cards: spring (tension 300, friction 30)
- No parallax, no confetti; the product celebrates with *information* (match card), not animation

## Dark mode
Full parity: graphite #1F1F22 base, cards #2A2A2E, accent stays #F5A524, text as above.
Onboarding is dark-first; app is light-first with dark toggle.

## Principles (from the reference)
1. One accent color, ever.
2. Every screen has ONE primary action.
3. Calm > clever. If a decoration doesn't reduce a decision's cost, cut it.
4. Warmth comes from tone (copy + amber), not from clutter.
