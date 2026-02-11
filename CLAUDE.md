# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
```

No test runner or linter is configured.

## Architecture

Next.js 14 App Router application — a personal weekly schedule planner with Google Calendar integration, deployed as a PWA on Vercel.

**Auth & Access Control:** NextAuth.js with Google OAuth. Only two emails can log in (OWNER_EMAIL, EA_EMAIL env vars). Roles are resolved server-side in `lib/roles.ts` by matching the session email. Owner gets full permissions; EA gets view/edit for schedule and calendar only.

**Key paths:**
- `app/page.tsx` — Home page (server component, renders Schedule)
- `app/login/page.tsx` — Google OAuth login (`"use client"`)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `app/api/calendar/route.ts` — Google Calendar CRUD proxy (GET/POST/PATCH/DELETE)
- `components/Schedule.tsx` — Main schedule UI (`"use client"`, inline styles, dark theme)
- `components/Providers.tsx` — NextAuth SessionProvider wrapper
- `lib/auth.ts` — NextAuth config, JWT callbacks, token refresh
- `lib/roles.ts` — Role resolution and permission matrix
- `lib/schedule-data.ts` — Hardcoded weekly schedule template (hourly blocks across 7 days)
- `lib/calendar.ts` — Google Calendar API client functions

**Data model:** Schedule blocks use short keys (`t`: time, `c`: category, `d`: description, `h`: hours). Categories: sleep, gym, immutable, engineroom, fitfocus, meetings, commute, personal, life — each with an assigned color.

## Conventions

- TypeScript strict mode with `@/*` path alias
- Server components by default; `"use client"` only for interactive components
- All styling is inline (no CSS files or libraries)
- Dark theme: `#0a0a0b` background, `#fafafa` text
- Minimal dependencies: next, next-auth, react, react-dom (no state management, UI, or HTTP libraries)
- Native `fetch()` for all API calls
- 2-space indentation, arrow functions preferred

## Environment Variables

Required variables are documented in `.env.example`: Google OAuth credentials, NEXTAUTH_SECRET/URL, owner/EA emails, and Google Calendar IDs per role (GCAL_ID_IMMUTABLE, GCAL_ID_ENGINEROOM, GCAL_ID_FITFOCUS, GCAL_ID_PERSONAL).
