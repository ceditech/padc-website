alter table public.board_members
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.board_members
  add column if not exists auth_status text not null default 'not_invited';

alter table public.board_members
  add column if not exists invited_at timestamptz;

alter table public.board_members
  add column if not exists invitation_accepted_at timestamptz;

alter table public.board_members
  add column if not exists last_login_at timestamptz;

alter table public.board_members
  drop column if exists password_hash;

update public.board_members
set email = lower(trim(email))
where email is not null;

update public.board_members
set auth_status = 'not_invited'
where auth_status is null;

create unique index if not exists board_members_email_unique_idx
on public.board_members (lower(email))
where email is not null;

create unique index if not exists board_members_user_id_unique_idx
on public.board_members (user_id)
where user_id is not null;
