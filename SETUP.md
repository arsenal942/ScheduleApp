# Schedule App — Setup Guide

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres)
- **Auth**: NextAuth.js with Google OAuth — role-based (Owner + EA)
- **Hosting**: Vercel (free tier)
- **PWA**: Installable on mobile via manifest
- **Calendar**: Google Calendar API (read + write via shared calendars)

---

## Step 1: Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **New Project** → name it `schedule-app` → Create
3. **APIs & Services → OAuth consent screen**
   - Choose **External**
   - App name: `Schedule App`
   - Add your email and your EA's email as **Test Users**
   - Save through all screens
4. **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
   - Type: **Web application**
   - Authorised JavaScript origins: `http://localhost:3000`
   - Authorised redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - **Copy the Client ID and Client Secret**
5. **APIs & Services → Library** → Search "Google Calendar API" → **Enable**

---

## Step 2: Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
   - Name: `schedule-app`
   - Region: Choose closest to you (Sydney for AU)
   - Generate a database password (save it)
2. Once the project is created, go to **SQL Editor**
3. Open `supabase/migration.sql` from this repo
4. Paste the entire contents into the SQL Editor and click **Run**
   - This creates `template_blocks`, `week_overrides`, and `schedule_audit` tables
5. Go to **Settings → API**
   - Copy the **Project URL** → this is your `SUPABASE_URL`
   - Copy the **service_role key** (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`
   - ⚠️ The service_role key bypasses RLS — never expose it client-side

---

## Step 3: Local Setup

```bash
cd schedule-app
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

OWNER_EMAIL=you@gmail.com
EA_EMAIL=your-ea@gmail.com

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
```

### Seed the database

This populates your schedule template into Supabase:

```bash
npm run seed
```

You should see:
```
🌱 Seeding schedule data...
  ✓ Monday: 14 blocks
  ✓ Tuesday: 14 blocks
  ...
✅ Seeded 95 blocks across 7 days.
```

To re-seed (clears existing data):
```bash
npm run seed -- --force
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## Step 4: Google Calendar Sharing (for EA)

1. Open [Google Calendar](https://calendar.google.com)
2. For each of your calendars (Immutable, EngineRoom, FitFocus, Personal):
   - Hover → 3 dots → **Settings and sharing**
   - **Share with specific people** → Add your EA's email → **Make changes to events**
3. Get each **Calendar ID** from Settings → Integrate calendar
4. Add them to your `.env.local` as `GCAL_ID_IMMUTABLE`, etc.

---

## Step 5: Deploy to Vercel

1. Push to a **private** GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add **all** environment variables:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → `https://your-app.vercel.app`
   - `OWNER_EMAIL`, `EA_EMAIL`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `GCAL_ID_*` (if configured)
4. Deploy
5. Update Google Cloud OAuth:
   - Add Vercel URL to Authorised JavaScript Origins
   - Add `https://your-app.vercel.app/api/auth/callback/google` to Redirect URIs
   - Ensure both emails are in Test Users

---

## Step 6: Install as PWA

**iOS**: Open URL in Safari → Share → "Add to Home Screen"
**Android**: Open URL in Chrome → Menu → "Install app"

---

## Editing the Schedule

### Template edits (permanent changes)
1. Tap **Edit** in the header
2. Tap any block to edit its time, category, description, or hours
3. Use ↑↓ arrows to reorder blocks
4. Use **+ Add block** buttons to insert new blocks
5. Delete blocks via the editor modal

### Week overrides (one-off changes)
1. Enter Edit mode
2. Tap **Override this week** on the day you want to change
3. This copies the template into a week-specific override
4. Edit the override blocks as needed
5. Tap **Revert to template** to remove the override

Overrides show an orange dot on the day selector and an "Override active" badge.

---

## Roles & Permissions

| Capability | Owner | EA |
|---|---|---|
| View schedule | ✓ | ✓ |
| Edit template blocks | ✓ | ✓ |
| Create week overrides | ✓ | ✓ |
| View/edit GCal events | ✓ | ✓ |
| Manage app settings | ✓ | ✗ |

All changes are audit-logged with the editor's email in the `schedule_audit` table.

---

## Security Notes

- Only configured emails can sign in (server-side check)
- Supabase service key is server-side only (never sent to browser)
- All mutations are audit-logged
- Calendar access uses Google's standard OAuth + sharing
- HTTPS enforced via Vercel