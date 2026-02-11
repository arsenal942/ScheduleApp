# Schedule App — Setup Guide

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js with Google OAuth — role-based (Owner + EA)
- **Hosting**: Vercel (free tier)
- **PWA**: Installable on mobile via manifest + service worker
- **Calendar**: Google Calendar API (read + write via shared calendars)

---

## Step 1: Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **New Project** → name it `schedule-app` → Create
3. In the sidebar, go to **APIs & Services → OAuth consent screen**
   - Choose **External**
   - App name: `Schedule App`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through Scopes and Test Users
   - On the **Test Users** screen, add **both** your Google email and your EA's Google email
   - Click **Save and Continue** → **Back to Dashboard**

4. Go to **APIs & Services → Credentials**
   - Click **+ Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `Schedule App`
   - Authorised JavaScript origins:
     - `http://localhost:3000`
     - `https://your-app.vercel.app` (add after first deploy)
   - Authorised redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-app.vercel.app/api/auth/callback/google`
   - Click **Create**
   - **Copy the Client ID and Client Secret**

5. Enable the Google Calendar API:
   - Go to **APIs & Services → Library**
   - Search "Google Calendar API" → Click → **Enable**

---

## Step 2: Google Calendar Sharing (for EA access)

Your EA needs access to your calendars through the app. The simplest way:

### Share each calendar with your EA:

1. Open [Google Calendar](https://calendar.google.com) in a browser
2. For **each** of your 3 work calendars (Immutable, EngineRoom, FitFocus):
   - Hover over the calendar in the left sidebar → click the 3 dots → **Settings and sharing**
   - Under "Share with specific people", click **+ Add people**
   - Enter your EA's Google email
   - Set permission to **Make changes to events**
   - Click **Send**
3. Your EA will receive an email to accept each shared calendar

### Get your Calendar IDs:

1. For each calendar, go to **Settings and sharing**
2. Scroll to **Integrate calendar**
3. Copy the **Calendar ID** (looks like `abc123@group.calendar.google.com` or just your email for primary)
4. You'll add these to your `.env.local` file

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
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Access control — only these two emails can log in
OWNER_EMAIL=your@gmail.com
EA_EMAIL=your-ea@gmail.com

# Google Calendar IDs (add when ready for GCal integration)
GCAL_ID_IMMUTABLE=
GCAL_ID_ENGINEROOM=
GCAL_ID_FITFOCUS=
GCAL_ID_PERSONAL=
```

Generate the NextAuth secret:
```bash
openssl rand -base64 32
```

Run locally:
```bash
npm run dev
```

---

## Step 4: Deploy to Vercel

1. Push to a **private** GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add **all** environment variables in Vercel dashboard
4. Deploy
5. Go back to Google Cloud Console → Credentials → Edit OAuth client:
   - Add your Vercel URL to Authorised JavaScript Origins
   - Add `https://your-app.vercel.app/api/auth/callback/google` to Redirect URIs
6. Go back to Google Cloud Console → OAuth consent screen → Test Users:
   - Ensure both your email and EA's email are listed

---

## Step 5: Install as PWA

### iOS (Safari)
1. Open deployed URL in Safari
2. Tap Share → "Add to Home Screen"

### Android (Chrome)
1. Open deployed URL in Chrome
2. Tap menu → "Install app"

---

## Step 6: Google Calendar Integration

The app is pre-configured to pull events from your shared calendars. To enable:

1. Add your Calendar IDs to the environment variables (see Step 3)
2. Both you and your EA will see your calendar events in the app
3. Your EA can create/move/cancel events on your calendars because you granted them edit access in Step 2

### How it works:
- **You log in**: Your own OAuth tokens access your calendars directly
- **EA logs in**: Their OAuth tokens access your calendars via the sharing you set up
- **Same data, same permissions** — the app doesn't need to store your tokens separately

---

## Roles & Permissions

| Capability | Owner | EA |
|---|---|---|
| View schedule | ✓ | ✓ |
| View GCal events | ✓ | ✓ |
| Create/edit/delete GCal events | ✓ | ✓ |
| Edit schedule template | ✓ | ✓ |
| Manage app settings | ✓ | ✗ |
| Add/remove users | ✓ | ✗ |

---

## Security Notes

- Only the two configured emails can access the app
- All auth is server-side via NextAuth
- HTTPS enforced via Vercel
- Calendar access uses Google's standard OAuth + sharing model
- No calendar tokens stored server-side — each user authenticates with their own Google account
- Role is determined server-side by matching email to env vars (cannot be spoofed client-side)

---

## Future Enhancements

- **Planned vs Actual view**: Compare schedule template against real GCal events
- **Database**: Add Supabase/PlanetScale for runtime schedule edits (currently template is in code)
- **Notifications**: Push notifications for upcoming block transitions
- **Weekly report**: Auto-generate hours worked per role from GCal data
