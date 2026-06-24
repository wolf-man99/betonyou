-- =============================================================================
-- Bet On You (BOY) — Supabase schema
-- Run this in the Supabase SQL editor for your project.
-- =============================================================================

-- ---- Tables ----------------------------------------------------------------

-- Users profile (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) primary key,
  name text,        -- nullable: set by the user in the NAME step after OTP
  phone text,
  avatar_url text,
  boy_points_balance integer default 0,
  created_at timestamptz default now()
);

-- Auto-create the public.users row the moment a new auth user is created.
-- This prevents FK failures on bets/checkins/transactions when client-side
-- profile creation races against the session being ready.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone, name)
  values (new.id, new.phone, null)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bets
create table if not exists public.bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  goal_type text not null,             -- 'fitness' | 'productivity' | 'learning' | 'custom'
  description text not null,
  amount integer not null,             -- stored in paise (₹1 = 100 paise)
  duration_days integer not null,
  checkin_frequency text not null,     -- 'daily' | 'weekly'
  start_date date not null,
  end_date date not null,
  status text default 'active',        -- 'active' | 'won' | 'forfeited' | 'pending_payment'
  platform_fee_paid boolean default false,
  checkins_required integer not null,
  checkins_completed integer default 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

-- Check-ins
create table if not exists public.checkins (
  id uuid default gen_random_uuid() primary key,
  bet_id uuid references public.bets(id) not null,
  user_id uuid references public.users(id) not null,
  photo_url text not null,
  gps_lat decimal,
  gps_lng decimal,
  gps_verified boolean default false,
  checked_at timestamptz default now()
);

-- Transactions (wallet ledger)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  type text not null,                  -- 'bet_placed' | 'bet_won' | 'bet_forfeited' | 'tip' | 'platform_fee' | 'withdrawal'
  amount integer not null,             -- in paise, positive = credit, negative = debit
  description text,
  bet_id uuid references public.bets(id),
  created_at timestamptz default now()
);

-- Withdrawal requests
create table if not exists public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  amount integer not null,             -- in paise
  upi_id text not null,
  status text default 'pending',       -- 'pending' | 'approved' | 'rejected'
  requested_at timestamptz default now()
);

-- ---- Row Level Security ----------------------------------------------------

alter table public.users enable row level security;
alter table public.bets enable row level security;
alter table public.checkins enable row level security;
alter table public.transactions enable row level security;
alter table public.withdrawals enable row level security;

drop policy if exists "Users own data" on public.users;
drop policy if exists "Users own bets" on public.bets;
drop policy if exists "Users own checkins" on public.checkins;
drop policy if exists "Users own transactions" on public.transactions;
drop policy if exists "Users own withdrawals" on public.withdrawals;

create policy "Users own data" on public.users for all using (auth.uid() = id);
create policy "Users own bets" on public.bets for all using (auth.uid() = user_id);
create policy "Users own checkins" on public.checkins for all using (auth.uid() = user_id);
create policy "Users own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users own withdrawals" on public.withdrawals for all using (auth.uid() = user_id);

-- ---- Storage ---------------------------------------------------------------

-- Create the private check-in photos bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('checkin-photos', 'checkin-photos', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Storage policies: users can only touch files under their own {user_id}/ prefix.
drop policy if exists "Checkin photos read own" on storage.objects;
drop policy if exists "Checkin photos write own" on storage.objects;

create policy "Checkin photos read own" on storage.objects
  for select using (
    bucket_id = 'checkin-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Checkin photos write own" on storage.objects
  for insert with check (
    bucket_id = 'checkin-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
