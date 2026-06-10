create extension if not exists pgcrypto;

create table if not exists public.driver_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  neighborhood text,
  platforms text,
  source text,
  message text,
  status text not null default 'new'
);

create index if not exists driver_leads_created_at_idx on public.driver_leads (created_at desc);
create index if not exists driver_leads_status_idx on public.driver_leads (status);

create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  organization text not null,
  title text,
  email text not null,
  phone text,
  inquiry_type text not null,
  message text not null,
  status text not null default 'new'
);

create index if not exists partner_inquiries_created_at_idx on public.partner_inquiries (created_at desc);
create index if not exists partner_inquiries_status_idx on public.partner_inquiries (status);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  organization text,
  email text not null,
  phone text,
  persona text not null,
  subject text not null,
  message text not null,
  status text not null default 'new'
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'website',
  status text not null default 'active'
);

create index if not exists newsletter_subscribers_created_at_idx on public.newsletter_subscribers (created_at desc);

alter table public.driver_leads enable row level security;
alter table public.partner_inquiries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- API routes use the server-only service role key. No public client policies are needed for this MVP.
