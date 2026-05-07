-- Run this in the Supabase SQL editor to create the wishlist table

create table if not exists wishlist (
  id          bigserial primary key,
  email       text not null unique,
  answers     jsonb,
  created_at  timestamptz not null default now()
);

-- Index for dedup lookups
create index if not exists wishlist_email_idx on wishlist (email);
