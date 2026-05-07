-- Run this in the Supabase SQL editor

create table if not exists wishlist (
  id          bigserial primary key,
  email       text not null unique,
  answers     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists wishlist_email_idx on wishlist (email);

-- Allow public inserts (this is a signup form — anyone can join the wishlist)
alter table wishlist enable row level security;

create policy "public can insert wishlist"
  on wishlist for insert
  with check (true);
