# PON Authenticated Web MVP

This is the first real-service implementation slice, separate from the promotional site and from the static UX prototype.

## Scope implemented

- Supabase email/password authentication and session persistence.
- Idea create, edit, draft, publish, list, search, and delete.
- Two visibility modes: `community` (published ideas readable by authenticated members) and `private` (owner only).
- PostgreSQL constraints and Row Level Security (RLS) policies are the authority for read/write access.
- Client-rendered user content uses `textContent`, not HTML injection.

## Explicitly not implemented

No production readiness is implied. There is no paid content, payment, Studio AI, file upload, matching, direct messaging, identity verification, moderation console, account deletion workflow, or audit/incident system. The existing promo site is not modified. Do not use real sensitive ideas or credentials for testing.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 7 requirement).
- A separate Supabase project for development/testing. Do not point this at production data.
- npm.

## Local setup (PowerShell)

From the repository root:

```powershell
Set-Location .\app\mvp
Copy-Item .env.example .env.local
notepad .env.local
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` using the project's public URL and publishable/anon client key. Never use the `service_role` key or any secret key in `.env.local` for this browser app. The publishable/anon key is expected to be visible to users; RLS is what protects data.

Apply `supabase/migrations/001_initial_schema.sql` to the test project using the Supabase SQL Editor or Supabase CLI. Review the SQL before running it. For a CLI workflow, link only the dedicated test project and run the migration through your team's normal migration process.

In Supabase Auth settings, configure email confirmation and allowed redirect URLs for local testing. For production, configure the exact deployed app URLs and review password policy, rate limits, abuse controls, backup settings, and data region.

Then run:

```powershell
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }
npm run dev
```

Vite normally prints a local URL. Open it in the browser. Do not publish this app via GitHub Pages: client-side environment variables and auth redirect URLs need a deliberate deployment setup, and GitHub Pages alone does not provide a backend.

## Minimum manual security test plan

Use two test accounts, A and B, in the development project only.

1. Sign up A and B; confirm the email flow works.
2. As A, create a published `community` idea and a `private` idea. Also save a draft.
3. As B, verify only A's published `community` idea appears. A's private idea and draft must not appear in the feed or search.
4. As B, attempt direct API reads of A's private/draft UUID using the Supabase client or REST API. Expected: no row is returned.
5. As B, attempt to update/delete A's idea by UUID. Expected: no row changes; API may return no row rather than a permission error.
6. Attempt to insert an idea with A's `user_id` while authenticated as B. Expected: RLS rejection.
7. Sign out and try reading the table using the anon key. Expected: no access.
8. Put HTML-like text such as `<img src=x onerror=alert(1)>` into a title/summary in the test project. It must display as text and never execute.
9. Test malformed/oversized input and network failures; the UI should not claim a save succeeded.
10. Review browser network traffic: no service-role key, password, or secret appears in requests or source.

Do not consider these checks passed until they are actually run and recorded. This first implementation has not been penetration-tested. Before production, add automated RLS integration tests, rate limiting/abuse controls, monitoring, backups and a verified restore drill, incident response ownership, privacy/deletion rules, and an external security review appropriate to the threat model.
