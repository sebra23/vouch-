# MVP Scope — launch Monday 2026-11-02

## v0.1 "works for a user" definition (this week)
1. Landing page + login (Google + Microsoft)                 [Mon-Tue]
2. 6-step onboarding wizard (mirrors observed flow):
   1. Intro (what it does + "never sends without approval")
   2. Routines selection: Auto-inbox, Morning Briefing,
      Meeting Briefing, Loose-Ends Sweep (toggles + sub-options)
   3. Profile summary review (from Gmail/Calendar read — LLM-drafted, user edits)
   4. Integrations connect: Google/Microsoft (live), Slack/GitHub/Notion/Calendry (UI stubs)
   5. Scheduling preferences (working hours, meeting distribution)
   6. Assistant persona: name, personality, avatar picker (OUR icons), email address
3. Main app shell: threads sidebar + chat + For-you suggestions
4. Chat: LLM with tools (calendar read, gmail search/label draft, scheduling draft)
5. Routines engine (cron): Morning Briefing email, Auto-inbox labels+drafts
6. Wiki auto-bootstrap (profile page + people from contacts)
7. Powers pages: Routines list w/ toggles, Skills (upload SKILL.md), Integrations grid
8. Library + Search + Settings + Logs
9. Pricing page + credits meter (replicating observed Free/Starter/Pro tier structure
   with our own branding; Stripe checkout wired but in test mode — no live charges Monday)
10. Explore catalog: 12 routine cards (4 live + 8 described), integration grid 30+ (2 live, rest labeled 'coming soon') honestly
10. Deploy: Vercel + Supabase Postgres; cron via Vercel crons

## Explicitly OUT of v0.1 (post-launch)
Voice calls, iOS/Mac apps, WhatsApp/Telegram/SMS channels, Teams/billing plans,
referral credits, meeting transcription, Fathom/Granola/Gong integrations.
