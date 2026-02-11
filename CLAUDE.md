# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run seed     # Populate Supabase with schedule template (--force to re-seed)
```

No test runner or linter is configured.

## Architecture

Next.js 14 App Router + Supabase (Postgres) — a personal weekly schedule planner with in-app editing, week overrides, Google Calendar integration, and executive assistant access. Deployed as a PWA on Vercel.

### Data flow

Schedule blocks live in Supabase across three tables (schema in `supabase/migration.sql`):
- **`template_blocks`** — the recurring weekly schedule (seeded from `lib/schedule-data.ts` via `scripts/seed.ts`)
- **`week_overrides`** — week-specific exceptions that replace template blocks for a given week+day
- **`schedule_audit`** — audit log of all mutations with performer email

The resolution logic is in `lib/schedule-db.ts:getEffectiveBlocks()`: if an override exists for the requested week+day, use it; otherwise fall back to the template.

### API routes

All routes require an authenticated session (NextAuth) and resolve the user's role before proceeding:
- `app/api/blocks/route.ts` — CRUD + reorder for template blocks
- `app/api/overrides/route.ts` — create/delete week overrides, get effective blocks
- `app/api/calendar/route.ts` — Google Calendar CRUD proxy across multiple calendars
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler

API pattern: each route defines a local `getSession()` helper that checks auth + role, and a `json()` helper for responses. All mutations call `logAudit()`.

### Auth & access control

NextAuth.js with Google OAuth. Only two emails can sign in (OWNER_EMAIL, EA_EMAIL env vars). Roles resolved server-side in `lib/roles.ts` by email match. Owner gets full permissions; EA gets view/edit for schedule and calendar only.

### Frontend

- `components/Schedule.tsx` — main UI (`"use client"`), handles view and edit modes, day selection, weekly hour totals, override management
- `components/BlockEditor.tsx` — modal for creating/editing individual blocks
- `components/Providers.tsx` — NextAuth SessionProvider wrapper
- `app/page.tsx` — server component, renders Schedule
- `app/login/page.tsx` — Google OAuth login page

### Key lib modules

- `lib/supabase.ts` — server-side Supabase client (service role key, bypasses RLS)
- `lib/schedule-db.ts` — all Supabase queries: template CRUD, overrides, audit logging, effective block resolution
- `lib/schedule-data.ts` — types (`Block`, `Category`, `DayName`), category color/icon map, seed data (`SEED_DATA`, `DAYS`)
- `lib/auth.ts` — NextAuth config, JWT callbacks, token refresh
- `lib/calendar.ts` — Google Calendar API client functions
- `lib/roles.ts` — role resolution and permission matrix

## Conventions

- TypeScript strict mode with `@/*` path alias
- Server components by default; `"use client"` only for interactive components
- All styling is inline (no CSS files or libraries). Dark theme: `#0a0a0b` background, `#fafafa` text
- Block data model keys: `time_label`, `category`, `description`, `hours`, `sort_order`, `day`
- Categories: sleep, gym, immutable, engineroom, fitfocus, commute_er, commute_ff, personal, meeting, life — each with color, text color, icon, and label in the `CATEGORIES` map
- Minimal dependencies: next, next-auth, react, react-dom, @supabase/supabase-js
- Native `fetch()` for all client-side API calls
- 2-space indentation, arrow functions preferred

## Environment Variables

See `.env.example` and `SETUP.md`. Required: Google OAuth credentials, NEXTAUTH_SECRET/URL, OWNER_EMAIL, EA_EMAIL, SUPABASE_URL, SUPABASE_SERVICE_KEY. Optional: GCAL_ID_IMMUTABLE, GCAL_ID_ENGINEROOM, GCAL_ID_FITFOCUS, GCAL_ID_PERSONAL.
