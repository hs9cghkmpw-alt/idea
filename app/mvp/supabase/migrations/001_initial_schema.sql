-- PON authenticated MVP: ideas only.
-- Apply with Supabase CLI or paste into the SQL Editor of a NEW test project.
-- Never run against a production project without reviewing the migration first.

create extension if not exists pgcrypto;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  summary text not null check (char_length(btrim(summary)) between 1 and 500),
  body text not null default '' check (char_length(body) <= 20000),
  category text not null default 'その他' check (char_length(category) between 1 and 40),
  visibility text not null default 'community' check (visibility in ('community', 'private')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideas_public_feed_idx
  on public.ideas (updated_at desc)
  where status = 'published' and visibility = 'community';
create index if not exists ideas_owner_updated_idx
  on public.ideas (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at
before update on public.ideas
for each row execute function public.set_updated_at();

alter table public.ideas enable row level security;
alter table public.ideas force row level security;

revoke all on public.ideas from anon;
grant select, insert, update, delete on public.ideas to authenticated;

drop policy if exists "Members read published community ideas or their own" on public.ideas;
create policy "Members read published community ideas or their own"
on public.ideas for select to authenticated
using (
  user_id = (select auth.uid())
  or (status = 'published' and visibility = 'community')
);

drop policy if exists "Members create only their own ideas" on public.ideas;
create policy "Members create only their own ideas"
on public.ideas for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Members update only their own ideas" on public.ideas;
create policy "Members update only their own ideas"
on public.ideas for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Members delete only their own ideas" on public.ideas;
create policy "Members delete only their own ideas"
on public.ideas for delete to authenticated
using (user_id = (select auth.uid()));

comment on table public.ideas is
  'PON MVP ideas. Private drafts and private ideas are protected by RLS; clients are untrusted.';
comment on column public.ideas.visibility is
  'community means authenticated members may read published content; private means owner only. Limited visibility intentionally not implemented yet.';

-- Security boundary:
-- * The browser uses only the Supabase publishable/anon key.
-- * Never expose service_role keys to client code.
-- * Paid body sections, attachments, matching, identity verification and payments are out of scope.
-- * Supabase project Auth settings, email confirmation, allowed redirect URLs, rate limits,
--   backups, monitoring and production policies must be reviewed separately before launch.
