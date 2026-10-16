# PON — Security Baseline and Release Gates

- Status: Proposed minimum security baseline; not a claim that the prototype or production system is secure
- Updated: 2026-10-16
- Assets: private ideas/drafts, paid content, account identity, match disclosures/consents, payment records, verification status, reports, secrets and audit records.

## 1. Security objectives

Protect confidentiality of drafts, limited/private ideas, paid content and match disclosures; integrity of consent, purchases and entitlements; availability and recoverability; and minimize personal-data collection/retention.

## 2. Threat model

| Threat | Example | Required controls |
|---|---|---|
| BOLA/IDOR | Member substitutes another user’s idea or purchase ID | Per-resource server authorization; negative tests |
| Session compromise | Stolen cookie, weak recovery, session fixation | Maintained auth framework/provider, secure cookies, rotation/revocation |
| Paid content leakage | Paid text exposed in HTML, API, cache, file or log | Separate protected resource, entitlement checks, leakage tests |
| Forged payment state | Browser redirect or replayed webhook grants access | Signature verification, transaction matching, idempotency, reconciliation |
| Consent race/replay | Concurrent consent creates match on stale terms | Immutable terms version, transaction/conditional transition, uniqueness |
| User content attack | XSS, malicious links/files, oversized uploads | Safe rendering, sanitizer, CSP, allowlists, size limits, malware scanning where appropriate |
| Harassment/scams | Spam requests, doxxing, stalking | Rate limits, report/block, minimal disclosure, moderation/suspension |
| Privileged misuse | Moderator browses unrelated drafts | Least privilege, case-scoped access, audit and review |
| Secret leakage | API key committed or printed in logs | Secret scanning, secret manager, rotation/revocation runbook |
| Supply-chain compromise | Vulnerable dependency or CI workflow | Dependency scanning, reviewed/pinned actions, least-privilege CI |
| Data loss/ransomware | Accidental deletion or compromised account | Encrypted backups, separate access boundary, restore drills |
| Cost/availability abuse | Bots flood uploads, AI or checkout | Quotas, rate limits, upload limits, budget alerts, kill switches |
| Privacy side channel | Search/counts/notifications reveal private content | Shared authorization policy across search, cache, preview and notification |

## 3. Authentication and sessions

- Prefer a maintained identity provider or well-reviewed framework. Do not invent password cryptography/session tokens.
- If passwords are stored, use a current framework-recommended password hashing algorithm; never plaintext or reversible encryption.
- HTTPS everywhere in production; enable HSTS after validating all relevant subdomains/TLS.
- Cookies: Secure, HttpOnly, appropriate SameSite, narrow scope; rotate after login/privilege changes; revoke on logout, reset and suspension.
- Protect cookie-authenticated mutations against CSRF; validate origin and use framework-supported CSRF tokens as appropriate.
- Validate post-login return URLs against local allowlisted paths to prevent open redirects.
- Rate-limit login, registration, reset, verification, checkout, publishing and match-request endpoints; avoid account enumeration.
- Require MFA for privileged operator accounts. Review and revoke unused privileged access.
- Never log cookies, passwords, reset tokens, access tokens or callback URLs containing secrets.

## 4. Authorization and data boundaries

- Deny by default; server-side authentication and per-resource authorization for every read, write, search result, export, notification and file download.
- Centralize policy checks; client route guards and hidden buttons are not controls.
- Separate member, moderator, commerce-support and security-admin permissions.
- Private ideas, paid bodies, reports, verification metadata and match disclosures must not live in public/static assets.
- Use short-lived scoped file URLs only after authorization. Validate file signature/type, MIME, filename, size and storage path; use safe content disposition.
- Treat text, Markdown, links, HTML, SVG and uploaded documents as untrusted. Use contextual encoding, maintained sanitization for allowed markup, and restrictive CSP.
- Minimize sensitive data. Do not collect government ID/My Number images in PON. If external verification is used, retain only minimum status, provider/method reference and timestamps.
- Use parameterized DB queries, strict request schemas, output encoding, body limits and pagination caps.

## 5. API/database integrity

- Reject unexpected fields on security-sensitive operations.
- Opaque IDs are not authorization.
- Define foreign keys, unique/check constraints and transactions for purchases, entitlements, active requests, consent versions and state transitions.
- Use idempotency keys for retryable commands and unique provider event IDs for webhook deduplication.
- Ownership, roles, visibility, price, payment, entitlement, verification, consent and match state are server-authoritative.
- Use optimistic concurrency/version fields for edits and transitions.
- Return safe errors; never expose stack traces, SQL, secrets or hidden-resource details.
- Set request timeouts, payload limits, pagination caps and route-level rate limits. Use an outbox/durable queue for post-commit notifications.

## 6. Web/browser protections

Validate these against actual staging/production responses:
- HTTPS/TLS and HSTS.
- Restrictive Content Security Policy; avoid inline scripts where practical.
- X-Content-Type-Options: nosniff; suitable Referrer-Policy and Permissions-Policy.
- Clickjacking defense via CSP frame-ancestors or equivalent.
- Explicit CORS allowlist; never credentialed requests with wildcard origins.
- Correct private/no-store cache headers for account, paid, private and matching responses.
- CSRF protection for cookie sessions; OAuth state/PKCE if OAuth is selected.
- Dependency/static analysis in CI; do not assume headers are correct without testing deployed responses.

## 7. Secrets, infrastructure and CI/CD

- No secrets in source, Git history, client bundles, static-site variables, screenshots, logs or fixtures.
- Inject secrets via environment/secret manager; separate development/staging/production credentials. Rotate any exposed secret; deleting the latest copy does not remove exposure from history or deployments.
- Least-privilege GitHub Actions permissions; review/pin third-party actions to immutable references where practical; protect production environments and require review.
- Enable secret scanning, dependency alerts and code scanning where available. Review lockfiles/transitive dependencies.
- Keep databases/internal ports private unless needed; use private networking and TLS as appropriate.
- Do not copy production personal data to development/staging without a minimized, protected, documented process.
- Define kill switches for payments, matching, uploads and AI.

## 8. Logging, privacy and incident response

- Audit auth failures, privilege changes, denied access, visibility changes, consent transitions, webhook processing, entitlement changes, moderator access, reports, blocks, exports and account deletion.
- Audit events must be append-only to normal app roles, attributable, timestamped and protected from tampering. Restrict access and define retention.
- Exclude passwords, secrets, session tokens, card data, ID documents and unnecessary private/paid content from logs.
- Define severity, accountable owner, alert channel, containment, credential rotation, evidence preservation, notification decision and post-incident review.
- Operator runbook must support disabling features, revoking sessions, suspending accounts/content and reconciling payments.
- Define retention/deletion by data category. Account deletion must preserve only legally/operationally required records; retention is not permission to keep everything forever.

## 9. Backup and recovery

- Encrypt backups in transit/at rest; separate backup credentials from application credentials.
- Define RPO (acceptable data loss) and RTO (recovery time) according to scale/budget before launch.
- Schedule backups and run restore drills. A successful backup job alone does not prove recovery works.
- Alert on stale/failed/unexpectedly small backups.
- Document restore integrity checks and safe handling of webhooks/outbox jobs after restore to prevent duplicate side effects.

## 10. Security test gates

Before real-user launch:
- Approve threat model and data-flow review.
- Test every role/resource authorization path, including BOLA/IDOR.
- Test authentication/recovery, CSRF, session revocation, rate limits, XSS, uploads and headers.
- Inspect paid-content exposure in API, page source, cache, search, metadata, files and logs.
- Test webhook invalid signature, replay, duplicate, out-of-order, wrong amount/currency/order and retries.
- Test concurrent consent, stale terms, expiry, block/suspension and withdrawal.
- Run dependency/secret scans in CI; no unresolved critical/high findings without documented acceptance by an accountable owner.
- Complete backup restore and incident-response tabletop exercise.
- Obtain risk-appropriate independent security review before enabling private content, payments and matching.
- Verify production config, monitoring, alert delivery and feature kill switches in staging.

## 11. Prototype boundary

The static prototype is not a secure production service. It must not collect real credentials, private ideas, payment details, identity documents or real matching commitments. Browser-local state is user-controlled and not authoritative. Labels must clearly identify the demo.

## 12. Feature release gates

| Feature | Minimum gate |
|---|---|
| Authenticated idea sharing | Validated auth, server authorization, visibility tests, safe rendering, report/block workflow, deletion/retention policy |
| Limited/private ideas and files | Defined audience, protected storage/downloads, cache and IDOR tests, revocation semantics |
| Paid content | Approved seller/payment/refund/tax model, verified webhooks, idempotency, reconciliation, entitlement checks, support and legal review |
| Matching | Approved state machine, immutable terms/consent, rate limits, report/block/suspension operations and legal review for sensitive categories |
| AI Studio | Provider privacy/data-use review, user disclosure, minimization, quotas/budget caps, prompt-injection/output handling and abuse controls |
| Native apps | Mobile token/session storage review, deep-link validation, API parity, privacy-permission review and mobile security testing |

## 13. Launch-blocking rule

A correct-looking UI or happy-path demo does not establish security readiness. Every activation requires server enforcement, negative tests, monitoring, operational ownership, documented residual risks and explicit release approval.
