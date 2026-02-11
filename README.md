# Schedule

A personal weekly planner for managing three concurrent roles — **Immutable**, **EngineRoom**, and **FitFocus** — with hour-level time blocking, in-app editing, week overrides, Google Calendar integration, and executive assistant access.

Built with Next.js 14, Supabase (Postgres), deployed as a PWA on Vercel.

---

## Why This Exists

Running three jobs simultaneously requires strict time accounting. Generic calendar apps don't enforce hour targets or distinguish between roles at a glance. This app provides a fixed weekly template with exact hour allocations per role, in-app editing so you or your EA can adjust blocks without touching code, one-off week overrides for schedule exceptions, and Google Calendar integration to compare planned blocks against actual events.

## Features

### Schedule View
- Day-by-day timeline with every block from 5 AM gym through 11 PM sleep
- Weekly hour totals with target tracking (ER 20h, FF 21h, Immutable ~38h)
- Colour-coded categories: work roles, commute, meetings, life blocks, personal
- Day type indicators: office, remote, weekend

### In-App Editing
- **Edit mode** toggle in the header — tap to enter, tap to exit
- **Edit blocks**: tap any block to change its time, category, description, or hours
- **Add blocks**: `+` buttons between every block and at the end of the day
- **Delete blocks**: delete button in the editor modal
- **Reorder blocks**: ↑↓ arrows on each block to move it up or down
- All changes persist to Supabase and are audit-logged

### Week Overrides
- **Override this week**: copies the template into a week-specific version you can edit
- **Revert to template**: removes the override, restoring the base schedule
- Override days show an orange dot on the day selector
- Overrides only affect the specific week — the base template stays intact

### Auth & Access Control
- Google OAuth via NextAuth.js
- Two roles: **Owner** and **EA** (executive assistant)
- Email allowlist — only configured accounts can sign in
- Role badge displayed in the header

### Google Calendar
- Full CRUD API (read, create, update, delete) across multiple calendars
- EA accesses owner's calendars via Google's native sharing
- Calendar IDs configured via environment variables

### PWA
- Installable on iOS and Android home screens
- Standalone display mode

---

## Data Model

### `template_blocks`
The base weekly schedule. Each row is one time block (e.g. "Monday 6:45–10:00 PM, EngineRoom deep work, 3.25h"). Edits here change the recurring weekly template permanently.

### `week_overrides`
Week-specific schedule exceptions. When present for a given `week_start + day`, these blocks **replace** the template for that day only. Created by clicking "Override this week" in edit mode.

### `schedule_audit`
Every create, update, delete, reorder, and override action is logged with the performer's email and a timestamp.

---

## Weekly Hour Breakdown

| Role | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
|------|-----|-----|-----|-----|-----|------|-----|-------|
| Immutable | 8.75 | 9.0 | 7.25 | 9.0 | 7.25 | — | — | **41.25h** |
| EngineRoom | 4.50 | 4.25 | 2.50 | 4.25 | 2.00 | 1.25 | 1.25 | **20.00h** |
| FitFocus | 2.00 | 2.00 | 2.00 | 2.00 | 2.00 | 5.50 | 5.50 | **21.00h** |
| Gym | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | **10.50h** |

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (Postgres, free tier)
- **Auth**: [NextAuth.js](https://next-auth.js.org) with Google OAuth
- **Calendar**: Google Calendar API (REST)
- **Hosting**: [Vercel](https://vercel.com) (free tier)
- **Language**: TypeScript

---

## Project Structure

```
schedule-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── blocks/route.ts               # Template blocks CRUD + reorder
│   │   ├── calendar/route.ts             # GCal CRUD
│   │   └── overrides/route.ts            # Week overrides CRUD
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BlockEditor.tsx                   # Edit/create block modal
│   ├── Providers.tsx
│   └── Schedule.tsx                      # Main UI (view + edit modes)
├── lib/
│   ├── auth.ts                           # NextAuth config
│   ├── calendar.ts                       # GCal API helpers
│   ├── roles.ts                          # Role definitions + permissions
│   ├── schedule-data.ts                  # Types, categories, seed data
│   ├── schedule-db.ts                    # Supabase query layer
│   └── supabase.ts                       # Supabase client
├── scripts/
│   └── seed.ts                           # Populate DB with initial schedule
├── supabase/
│   └── migration.sql                     # Database schema
├── public/                               # PWA manifest + icons
├── .env.example
├── SETUP.md                              # Full setup walkthrough
└── package.json
```

---

## Getting Started

```bash
npm install
cp .env.example .env.local    # Fill in all values
npm run seed                  # Populate Supabase with schedule
npm run dev                   # http://localhost:3000
```

> See [SETUP.md](./SETUP.md) for the complete walkthrough: Google Cloud, Supabase, calendar sharing, Vercel deployment, and PWA installation.

---

## Roles

| | Owner | EA |
|---|---|---|
| View schedule | ✓ | ✓ |
| Edit template blocks | ✓ | ✓ |
| Create week overrides | ✓ | ✓ |
| View/edit GCal events | ✓ | ✓ |
| Manage app settings | ✓ | ✗ |

---

## Roadmap

- [ ] Planned vs actual comparison view (GCal events overlaid on schedule)
- [ ] Push notifications for block transitions
- [ ] Weekly hours report auto-generated from GCal data
- [ ] Mobile-optimised event creation flow
- [ ] Drag-and-drop block reordering

---

## License

Private. Not for redistribution.