-- ── SUPABASE DATABASE SETUP SCRIPT ──
-- Paste and run this entire script inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wzmxaufdjuqoomcwtyyq/sql

-- 1. Drop projects table if it already exists (to start clean)
drop table if exists projects;

-- 2. Create projects table with matching column layout
create table projects (
  id text primary key,
  title text not null,
  category text not null,
  description text not null,
  live text not null,
  github text,
  "imageSrc" text default '',
  screenshots jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  highlights jsonb default '[]'::jsonb,
  "order" integer default 0,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table projects enable row level security;

-- 4. Create policy to allow public select (view) access
create policy "Allow public read-only access" on projects for select using (true);

-- 5. Grant all privileges to the Supabase roles (anon, authenticated, service_role)
grant all privileges on table projects to service_role;
grant all privileges on table projects to anon;
grant all privileges on table projects to authenticated;

-- Setup complete! Now you can run: node scratch-seed-supabase.js
