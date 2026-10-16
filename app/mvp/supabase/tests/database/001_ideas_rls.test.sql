-- Run against a disposable local Supabase database with: supabase test db
-- The transaction is rolled back, so the fixture rows are not persisted.
begin;

select plan(10);

-- Stable test-only principals. This file must never be run against production.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'pon-rls-a@example.test', '', now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'pon-rls-b@example.test', '', now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

insert into public.ideas (id, user_id, title, summary, category, visibility, status)
values
  ('20000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000001',
   'RLS public fixture', 'Published community fixture', '地域', 'community', 'published'),
  ('20000000-0000-4000-8000-000000000002',
   '10000000-0000-4000-8000-000000000001',
   'RLS private fixture', 'Private fixture', '地域', 'private', 'published'),
  ('20000000-0000-4000-8000-000000000003',
   '10000000-0000-4000-8000-000000000001',
   'RLS draft fixture', 'Draft fixture', '地域', 'community', 'draft');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is(
  (select count(*) from public.ideas),
  1::bigint,
  'Member B sees only published community ideas from member A'
);

select is(
  (select count(*) from public.ideas where id = '20000000-0000-4000-8000-000000000002'),
  0::bigint,
  'Member B cannot read member A private idea'
);

select is(
  (select count(*) from public.ideas where id = '20000000-0000-4000-8000-000000000003'),
  0::bigint,
  'Member B cannot read member A draft'
);

select is(
  (with changed as (
    update public.ideas set title = 'tampered by B'
    where id = '20000000-0000-4000-8000-000000000001'
    returning id
  ) select count(*) from changed),
  0::bigint,
  'Member B cannot update member A idea'
);

select is(
  (with removed as (
    delete from public.ideas
    where id = '20000000-0000-4000-8000-000000000001'
    returning id
  ) select count(*) from removed),
  0::bigint,
  'Member B cannot delete member A idea'
);

select throws_ok(
  $insert into public.ideas (user_id, title, summary, category, visibility, status)
    values ('10000000-0000-4000-8000-000000000001', 'Spoofed owner',
            'Should be rejected', '地域', 'community', 'published')$,
  '42501',
  null,
  'Member B cannot create an idea owned by member A'
);

select throws_ok(
  $insert into public.ideas (user_id, title, summary, category, visibility, status)
    values ('10000000-0000-4000-8000-000000000002', 'Invalid category',
            'Should fail DB constraint', 'made-up-category', 'community', 'published')$,
  '23514',
  null,
  'Database rejects categories outside the allowlist'
);

select throws_ok(
  $insert into public.ideas (user_id, title, summary, category, visibility, status)
    values ('10000000-0000-4000-8000-000000000002', repeat('x', 121),
            'Should fail DB constraint', '地域', 'community', 'published')$,
  '23514',
  null,
  'Database rejects titles exceeding the maximum length'
);

reset role;
select ok(
  not has_table_privilege('anon', 'public.ideas', 'SELECT'),
  'Anonymous role has no direct SELECT privilege on ideas'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is(
  (select count(*) from public.ideas where user_id = '10000000-0000-4000-8000-000000000001'),
  3::bigint,
  'Owner A can read their own public, private and draft ideas'
);

select * from finish();
rollback;
