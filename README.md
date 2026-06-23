# Bet On You (BOY)

A mobile-first web app for commitment betting. Set a personal goal, lock in a real-money stake, check in with a photo to prove progress, and either win your money back or forfeit it.

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
npm install
cp .env.example .env.local
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Enable **Phone** auth under _Authentication → Providers_.
4. Copy the project URL and anon key into `.env.local`.

## How it works

- **Onboarding → Auth** — 3-screen intro, then phone-OTP login.
- **Create Bet** — 4-step flow (goal → duration/frequency → stake → review).
- **Check in** — take a photo; GPS is read from EXIF.
- **Resolution** — auto-win on completion, auto-forfeit on deadline.
- **Wallet** — BOY points balance and transaction ledger.

## Project structure

```
src/
├── lib/        supabase, razorpay, betActions, revenue, dates, copy
├── hooks/      useAuth, useBets, useWallet
├── components/ ui primitives + BetCard, WalletCard, CheckInModal, ResolutionScreen
└── pages/      Onboarding, Auth, Home, CreateBet, BetDetail, Bets, Wallet, Profile
```
