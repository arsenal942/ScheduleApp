# Schedule

A personal weekly planner built for managing three concurrent roles — **Immutable**, **EngineRoom**, and **FitFocus** — with hour-level time blocking, Google Calendar integration, and executive assistant access.

Built with Next.js 14, deployed as a PWA on Vercel.

---

## Why This Exists

Running three jobs simultaneously requires strict time accounting. Generic calendar apps don't enforce hour targets or distinguish between roles at a glance. This app provides a fixed weekly template with exact hour allocations per role, visual clarity on where every hour goes, a role-based login so an EA can manage the schedule and calendars, and Google Calendar integration to compare planned blocks against actual events.

## Features

### Schedule View
- Day-by-day timeline showing every block from 5 AM gym through 11 PM sleep
- Weekly hour totals with target tracking (ER 20h, FF 21h, Immutable ~38h)
- Colour-coded categories: work roles, commute (productive), meetings, life blocks, personal time
- Day type indicators: office (Mon/Tue/Thu), remote (Wed/Fri), weekend

### Auth & Access Control
- Google OAuth via NextAuth.js
- Two roles: **Owner** and **EA** (executive assistant)
- Email allowlist — only configured accounts can sign in
- Role badge displayed in the header

### Google Calendar (v1 scaffolded)
- Full CRUD API for calendar events (read, create, update, delete)
- Pulls from multiple calendars (one per role + personal)
- EA accesses owner's calendars via Google's native sharing (no token delegation)
- Calendar IDs configured via environment variables

### PWA
- Installable on iOS and Android home screens
- Standalone display mode (no browser chrome)
- Works offline for viewing the schedule template

---

## Weekly Hour Breakdown

| Role | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
|------|-----|-----|-----|-----|-----|------|-----|-------|
| Immutable | 8.75 | 9.0 | 7.25 | 9.0 | 7.25 | — | — | **41.25h** |
| EngineRoom | 4.50 | 4.25 | 2.50 | 4.25 | 2.00 | 1.25 | 1.25 | **20.00h** |
| FitFocus | 2.00 | 2.00 | 2.00 | 2.00 | 2.00 | 5.50 | 5.50 | **21.00h** |
| Gym | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | 1.50 | **10.50h** |

### Schedule Invariants
- **Immutable** owns 9–5 every weekday. Protected and uninterrupted.
- **EngineRoom** = exactly 20h/wk. Weekday-heavy: commute BAU + evening deep work + remote mornings.
- **FitFocus** = 21h/wk. Light weekday BAU (2h/day), heavy weekend deep work (5.5h/day).
- **Commute** is productive: morning train → ER BAU, evening train → FF BAU.
- **Life blocks** are non-negotiable: Wed & Sat soccer, Fri date night, Sun church.
- **5 AM gym. 11 PM sleep. Every day.**

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Auth**: [NextAuth.js](https://next-auth.js.org) with Google OAuth
- **Calendar**: Google Calendar API (REST)
- **Hosting**: [Vercel](https://vercel.com) (free tier)
- **Language**: TypeScript
- **PWA**: Web App Manifest + meta tags

---

## Project Structure

```
schedule-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   └── calendar/route.ts             # GCal CRUD (GET/POST/PATCH/DELETE)
│   ├── login/page.tsx                    # Login page with Google OAuth
│   ├── layout.tsx                        # Root layout + PWA meta
│   └── page.tsx                          # Main page (auth gate)
├── components/
│   ├── Providers.tsx                     # Session provider wrapper
│   └── Schedule.tsx                      # Main schedule UI component
├── lib/
│   ├── auth.ts                           # NextAuth config + OAuth scopes
│   ├── calendar.ts                       # GCal API helpers (fetch/create/update/delete)
│   ├── roles.ts                          # Role definitions + permissions matrix
│   └── schedule-data.ts                  # Weekly schedule data + types
├── public/
│   ├── manifest.json                     # PWA manifest
│   ├── icon-192.png                      # App icon
│   └── icon-512.png                      # App icon (large)
├── .env.example                          # Environment variable template
├── next.config.js                        # Security headers
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud project with OAuth credentials
- Google Calendar API enabled

### 1. Clone and install

```bash
git clone <your-repo-url>
cd schedule-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
OWNER_EMAIL=you@gmail.com
EA_EMAIL=your-ea@gmail.com
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

> See [SETUP.md](./SETUP.md) for the full walkthrough including Google Cloud project setup, calendar sharing for your EA, and Vercel deployment.

---

## Roles

| | Owner | EA |
|---|---|---|
| View schedule | ✓ | ✓ |
| Edit schedule blocks | ✓ | ✓ |
| View GCal events | ✓ | ✓ |
| Create/edit/delete GCal events | ✓ | ✓ |
| Manage app settings | ✓ | ✗ |
| Add/remove users | ✓ | ✗ |

---

## Google Calendar Integration

The app uses Google's native calendar sharing rather than domain-wide delegation:

1. **Owner** shares each calendar (Immutable, EngineRoom, FitFocus, Personal) with the EA's Google account, granting "Make changes to events" permission.
2. **Both users** authenticate with their own Google accounts via OAuth.
3. **Both users** access the same calendars — the owner directly, the EA via sharing.

Calendar IDs are configured via environment variables (`GCAL_ID_IMMUTABLE`, `GCAL_ID_ENGINEROOM`, `GCAL_ID_FITFOCUS`, `GCAL_ID_PERSONAL`).

---

## Deployment

```bash
# Push to a private GitHub repo, then:
# 1. Import to Vercel
# 2. Add all env vars in Vercel dashboard
# 3. Update Google OAuth redirect URIs to include your Vercel URL
# 4. Add both emails as test users in Google Cloud Console
```

---

## Roadmap

- [ ] Planned vs actual comparison view (GCal events overlaid on schedule template)
- [ ] Database-backed schedule edits (currently template is in code)
- [ ] Push notifications for block transitions
- [ ] Weekly hours report auto-generated from GCal data
- [ ] Mobile-optimised event creation flow for EA

---

## License

Private. Not for redistribution.