# Bet On You (BOY)

A mobile-first web app for commitment betting. Set a personal goal, lock in a
real-money stake, check in with a photo to prove progress, and either win your
money back or forfeit it.

> **Bet On You** — put money where your goals are.

## Stack

| Layer      | Tech                                            |
| ---------- | ----------------------------------------------- |
| Frontend   | React + Vite (JavaScript, no TypeScript)        |
| Styling    | Tailwind CSS                                    |
| Backend    | Supabase (auth, Postgres, storage)              |
| Payments   | Razorpay                                        |
| Geo / EXIF | `exifr` (GPS extraction from check-in photos)   |
| Icons      | Lucide React                                    |
| Fonts      | Unbounded 700 · Inter 400/500/700 · DM Mono 500 |
| PWA        | `manifest.json` + service worker                |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in your Supabase + Razorpay keys

# 3. Run the dev server (http://localhost:3000)
npm run dev

# 4. Production build
npm run build && npm run preview
```

### Environment variables (`.env.local`)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RESEND_API_KEY=your_resend_api_key
```

> The app boots even without keys so the UI is reviewable, but auth, payments,
> and persistence require Supabase + Razorpay to be configured.

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates all tables, Row Level Security policies, the private
   `checkin-photos` storage bucket, and its storage policies.
3. Enable **Phone** auth (with an SMS provider) under
   _Authentication → Providers_.
4. Copy the project URL and anon key into `.env.local`.

## How it works

- **Onboarding → Auth** — 3-screen intro, then phone-OTP login. New users set a
  name which creates their `users` profile row.
- **Create Bet** — a 4-step flow (goal → duration/frequency → stake → review),
  charging the stake (+ optional ₹5 platform fee) via Razorpay before the bet
  is written.
- **Check in** — take a photo (rear camera via `capture="environment"`); GPS is
  read from EXIF, the image is uploaded to private storage, and the check-in
  count increments.
- **Resolution** — when all check-ins are done the bet is **won** (full stake
  credited back as BOY points); if the end date passes unmet it is
  **forfeited** (platform keeps 15%). Win/loss screens include a tip prompt.
- **Wallet** — BOY points balance, transaction ledger, and UPI withdrawal
  requests (min ₹100, manually approved).

### Money

All amounts are stored in **paise** (₹1 = 100 paise). See
[`src/lib/revenue.js`](src/lib/revenue.js) for the constants
(`MIN_BET`, `PLATFORM_FEE`, `TAKE_RATE`, ...) and formatting helpers.

## Project structure

```
src/
├── lib/        supabase, razorpay, betActions, revenue, dates, copy
├── hooks/      useAuth, useBets, useWallet
├── components/ ui primitives + BetCard, WalletCard, CheckInModal, ResolutionScreen
└── pages/      Onboarding, Auth, Home, CreateBet, BetDetail, Bets, Wallet, Profile
```

## Deploying to Vercel

1. Import the repo into Vercel (framework preset: **Vite**).
2. Add the four `VITE_*` environment variables.
3. Deploy. The included `manifest.json` + service worker make it installable
   ("Add to Home Screen") on mobile.

## Production notes

- Razorpay order creation and webhook verification should move to a Supabase
  Edge Function (or serverless route) with your Razorpay **secret** key — never
  ship secrets to the client. The client currently opens checkout with the
  public key id only.
- Bet resolution runs client-side on check-in; for forfeits that occur with no
  further activity, schedule a Supabase Edge Function (cron) to run
  `resolveBet` server-side.
- Resend (transactional email) is wired via env var for future notifications.
