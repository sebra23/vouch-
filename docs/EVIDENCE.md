# REA Evidence Record — town.com (public sources only)
Date: 2026-10-26 · Method: REA evidence discipline (observed / inferred / unknown)
Boundary: Town ToS §prohibitions on RE/scraping of "Town Technology" honored.
NO JS bundles downloaded. NO authenticated endpoints touched. NO automation vs their systems.

## OBSERVED (public marketing pages, standard browser-equivalent fetches)
- Pricing model (observed verbatim on /pricing):
  - Free $0: 30 chat msgs/mo, weekly briefing, all integrations, 7-day Pro trial
  - Starter $15/mo: 1,250 credits, daily briefing, auto-inbox, 2 custom routines
  - Pro $49/mo annual: 5,000 credits, unlimited routines, 50 person lookups, PAYG overage $0.044/cr
  - Power $99: 12,000 cr, $0.038/cr | Power Plus $199: 40,000 cr, $0.032/cr | Team plans pooled credits
  - Credits = usage unit for chats/runs/research lookups; overage cap defaults $0
  - Downgrade behavior: data preserved, paid features paused (saved, inactive)
- Routine catalog (observed: names + 1-line behaviors): Auto-inbox, Morning Briefing,
  Meeting Briefing, Loose-Ends Sweep, Decline Cold Outreach, Schedule Optimizer,
  Competitive Intel Briefing, Newsletter Digest, GitHub Reports, Relationship Reconnect,
  Deal Spotter, New User Research, custom "describe your own" builder
- Integration catalog (observed, 30+): Gmail, Google Calendar/Docs/Drive/Sheets, Outlook,
  Slack Persona + Bot, HubSpot, Notion, Granola, Calendly, Zoom, Salesforce, Dropbox,
  Asana, Linear, GitHub, Sentry, Brex, QuickBooks, Ramp, Text Messaging, iPhone app, Link
- Persona model: named assistant ("Townie") with personality, voice, own email address,
  assistant-to-assistant collaboration (Pro+)
- Team model: shared workspace, pooled credits, installable routines/skills, owner/admin roles
## OBSERVED (page source fingerprints — visible to any browser's view-source)
- Next.js + Turbopack immutable chunks; Vercel hosting; Sentry, Segment, Stripe markers
- Homepage 598 KB document, marketing-site rendering (not heavy SSR app shell)
## INFERRED (from observed; needs validation)
- Credits meter in-app (seen in user screenshot "Trial credit 100% left") maps to pricing tiers
- Wiki/person research lookups consume credits (pricing gates them by tier)
- "Skills" = SKILL.md upload (user screenshot shows upload of SKILL.md or zip)
## FROM USER'S OWN ACCOUNT (his content, supplied screenshots — lawful)
- 6-step onboarding order: intro → routines → profile summary → integrations → scheduling → persona/avatar/channels
- Sub-routine toggles (Auto-inbox: label/archive/draft/scheduling), scheduling prefs (working hours, meeting distribution, recurring rules)
- App shell: threads sidebar, For-you suggestions, Powers (routines/skills/integrations), Wiki, Library, Teams, referral credits, Logs
## UNKNOWN (deliberately not pursued — ToS boundary)
- API surface, auth internals, model routing, prompt/system logic, credit burn rates, infra costs
## IMPLICATIONS FOR CLONE
1. Pricing/credits UX moves INTO Monday scope (Free + trial + tier page + credits meter; charges stay stubbed)
2. Routine catalog: implement 4 core + Decline Cold Outreach + Newsletter Digest descriptions
3. Integration grid: 30+ entries, live only Google/Microsoft; rest "connect" stubs with honest labels
4. Stack choice validated: Next.js/Vercel/Stripe matches target's own public fingerprint
