# PON MVP deployment checklist

This deploys the Vite frontend as a Render Static Site. Supabase remains the authentication and database backend. The blueprint does **not** create a Supabase project, configure its database, or make the app production-ready.

## 1. Review before deployment

- [ ] Review `supabase/migrations/001_initial_schema.sql` and `supabase/tests/database/001_ideas_rls.test.sql`.
- [ ] Run the unit tests, production build, and local Supabase RLS suite.
- [ ] Use a dedicated Supabase project for staging. Do not test against production data.
- [ ] Do not use real sensitive ideas during initial verification.

## 2. Create the Render Static Site

1. In Render, create a Blueprint deployment from this repository and select `render.yaml`.
2. Set `VITE_SUPABASE_URL` to the staging Supabase project URL.
3. Set `VITE_SUPABASE_ANON_KEY` to that project's publishable/anon key.
4. Never put a Supabase `service_role` or secret key in these variables. `VITE_*` values are bundled into public browser assets; the publishable key is expected to be public.
5. Wait for the build to complete and note the actual deployed HTTPS URL.

## 3. Configure Supabase Auth

In the staging Supabase project:

- [ ] Enable email/password authentication.
- [ ] Set the Site URL to the actual deployed HTTPS URL.
- [ ] Add the exact deployed HTTPS URL to allowed redirect URLs.
- [ ] Add the local development URL only if local testing is needed.
- [ ] Review email confirmation, password policy, auth rate limits, and SMTP/email delivery settings.

Apply the migration to the **staging project only after reviewing it**. Do not run the pgTAP test fixture against a hosted production database.

## 4. Smoke test on the deployed URL

- [ ] New user can sign up and receives the expected confirmation flow.
- [ ] Confirmed user can log in and log out.
- [ ] Password reset email returns to the deployed app and allows a password update.
- [ ] User A can create, edit, publish, save a draft, and delete their own ideas.
- [ ] User B can see A's published community ideas but cannot read A's private ideas or drafts.
- [ ] User B cannot update or delete A's ideas through direct Supabase API requests.
- [ ] Signed-out/anonymous access cannot read the ideas table.
- [ ] HTML-like user content is displayed as text and never executes.
- [ ] Refresh preserves a valid session; logout clears visible private data.
- [ ] Browser network/source inspection confirms no service-role or secret key is exposed.
- [ ] Check mobile layout, keyboard navigation, and browser console/network errors.

Record each result as PASS, FAIL, or NOT RUN. Do not treat a successful build as proof that authentication, RLS, or the live deployment works.

## 5. Not a production launch gate by itself

This MVP currently does not provide AI-powered Studio, paid content, payments, matching, direct messaging, uploads, identity verification, moderation tools, user self-service account deletion, operational monitoring, or a verified backup restore process. Limited visibility is not implemented. Do not market these as available features.

Before accepting real sensitive content or opening a broad public launch, define and review privacy/retention/deletion processes, abuse reporting and moderation ownership, incident response, monitoring, backups and a tested restore procedure, legal terms/privacy notice, and an appropriate independent security review. Payment and investment/lending-related features require separate business and Japanese legal review before activation.
