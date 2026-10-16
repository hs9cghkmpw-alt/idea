# PON — Functional Requirements

- Status: Detailed-design draft
- Updated: 2026-10-16
- P0: required for a real launch. P1: in-scope domain requiring cost/policy gate before activation. P2: later enhancement.
- “In scope” means design scope, not that the current static prototype implements it.

## 1. Account and session

### FR-AUTH-01 — Account-only access (P0)
- All product browsing and interaction requires an authenticated account.
- The promotional site remains separately accessible without login.
- Unauthenticated product routes redirect to sign-in with a validated local return path.
- All APIs independently enforce authentication.

### FR-AUTH-02 — Account lifecycle (P0)
- Support registration, sign-in/out, recovery, and session revocation.
- Email verification policy depends on provider/security decision.
- Suspended/deleted accounts cannot perform normal actions.
- Rate-limit authentication attempts and prevent account enumeration in recovery flows.

### FR-AUTH-03 — Capabilities (P0)
- One account may read, create ideas, purchase content, and participate in matching.
- Operator/moderator privileges are separately granted and audited.
- Never grant elevated privileges from user-editable profile fields.

## 2. Discovery and publishing

### FR-IDEA-01 — Feed and search (P0)
- Members can browse only ideas they are authorized to see.
- Visibility restrictions are applied before results, snippets, and counts are returned.
- Loading, empty, and failure states are explicit.
- Advanced recommendation ranking is deferred until usage data exists.

### FR-IDEA-02 — Draft and publish (P0)
- Members can create, edit, preview, publish, unpublish/archive, and delete their own ideas under the retention policy.
- Minimum fields: title, summary, body, category, tags, visibility, lifecycle state, timestamps, version, owner.
- Studio is optional and never required to publish.
- Server validates lengths, formats, and state transitions.

### FR-IDEA-03 — Visibility enforcement (P0)
- Proposed modes: Community (all logged-in members), Limited (explicitly granted accounts and/or eligible match participants), Private (owner only).
- Enforce visibility for feed, search, detail, Studio artifacts, exports, notifications, previews, and attachments.
- Unauthorized responses must not leak sensitive metadata.
- Visibility changes cannot silently invalidate existing purchases or disclose private data; transition rules must be finalized.

### FR-IDEA-04 — Content safety (P0)
- Provide report and block actions.
- Validate and safely render user content; never treat submitted HTML as trusted code.
- Moderation state can restrict visibility and interactions.
- Define prohibited content, appeals, and repeat-offender policy before launch.

## 3. Free Studio

### FR-STUDIO-01 — Template-based structuring (P0)
- Provide at least one useful manual template: problem, idea, intended audience, value, next step.
- Members can edit, preview, and copy the result into an idea draft.
- Free functions do not call a paid AI API.
- UI says the result is template-based, not AI-generated.

### FR-STUDIO-02 — Save and reuse (P0/P1)
- Proposed minimum: save Studio work as a draft artifact linked to the owner.
- Owner can reopen and edit it.
- Decide whether artifacts are embedded in ideas or separate entities before schema migration.
- PDF/image export is not required unless cost and UX review justify it.

### FR-STUDIO-03 — Paid upgrade seam (P1; design now)
- Define provider-neutral operations for AI refinement, outline generation, diagrams, and document generation.
- Every operation needs explicit user consent, input/output limits, usage metering, timeout/error handling, and cost ceiling.
- Do not send private/limited content to external AI without clear disclosure and an appropriate user action.
- Free template functions remain usable if paid AI is unavailable.

## 4. Paid content and commerce

### FR-PAY-01 — Free preview and paid section (P1; design now)
- An idea may have free content plus an optional paid section.
- Server returns only free content and metadata unless entitlement is valid.
- Paid body must not be embedded in initial HTML, client state, public files, or unauthenticated asset URLs.
- If commerce is not live, show “not yet available” and do not accept payment.

### FR-PAY-02 — Purchase and entitlement (P1; design now)
- Purchase intent is not proof of payment.
- Grant access only after verified payment-provider confirmation.
- Store provider transaction reference, amount/currency, timestamps, state, and idempotency keys; never store raw card data.
- Duplicate webhooks must not duplicate purchases/grants.
- Document refunds, chargebacks, cancellation, and entitlement revocation before launch.

### FR-PAY-03 — Creator proceeds/accounting (P1; unresolved)
- Define platform fee, creator share, payment fees, payout threshold/schedule, tax responsibilities, refunds, and negative balances.
- No creator payout until eligibility, identity requirements, accounting, and provider support are confirmed.
- Do not promise earnings or publish rates before resolution.

### FR-PAY-04 — Subscription (P2 unless approved)
- Subscription is an extension, not an assumed launch requirement.
- Define renewal, cancellation, failed renewal, entitlement expiry, proration, and refunds separately from one-time purchase.

## 5. Matching

### FR-MATCH-01 — Interest request (P1; design now)
- Authenticated members can send structured interest requests to an idea/opportunity owner.
- States: pending, withdrawn, declined, accepted-for-mutual-consent, expired, matched, closed.
- Sender can withdraw before match completion.
- Apply rate limits and anti-spam controls.

### FR-MATCH-02 — Mutual consent (P1; design now)
- Create a match only after both parties confirm the same scope/terms version.
- Record actor, terms version, and timestamp for each consent.
- Material term changes require renewed consent.
- One-sided interest or initial acknowledgement is not a match.

### FR-MATCH-03 — Contact disclosure (P1; gated)
- Contact details remain hidden until required consent and verification conditions are met.
- Exact fields and verification trigger remain unresolved.
- Blocking, reporting, withdrawal, and closure prevent inappropriate further contact.
- Do not include open direct messaging unless moderation and abuse operations are staffed.

### FR-MATCH-04 — Funding-related categories (P1; legal gate)
- Capital, lending, subsidies, fundraising, investment, and securities-related categories must not support real transactions until Japanese legal review is complete.
- Displayed amounts are indicative, not commitments.
- PON does not hold, receive, escrow, transfer, distribute, or execute funds.
- No funding-amount-based success fee without specialist legal review.

## 6. Trust, safety, operations

### FR-TRUST-01 — Report/block (P0)
- Members can report ideas/accounts with reason category and optional explanation.
- Reports are visible only to authorized operators; reporter sees submission status.
- Blocking prevents new interaction and applies documented visibility restrictions.
- Minimize sensitive content retained in moderation records.

### FR-TRUST-02 — Moderation (P0)
- Operators can review, classify, restrict, remove, warn, suspend, and record resolutions according to policy.
- Privileged actions require authorization and audit records.
- Appeals/escalation policy must be resolved before launch.

### FR-TRUST-03 — Identity verification (P1; design now)
- Pseudonymous display identity may be allowed while account-only access remains mandatory.
- If third-party verification is required, retain minimum result metadata: status, method, timestamp, and provider reference only if necessary.
- Never store identity-document images or My Number images.
- Provider, cost, retention, and failure/retry policy remain open.

### FR-TRUST-04 — Account deletion/data rights (P0)
- Provide a deletion flow and retention policy before launch.
- Revoke sessions promptly.
- Delete/anonymize personal data where applicable; retain only justified legal/accounting/security records under documented policy.
- Explain effects on ideas, purchases, and matches before confirmation.

## 7. Explicitly deferred unless separately approved

- Native iOS/Android apps.
- AI generation in Studio.
- Subscription/membership products.
- Advanced recommendations and analytics.
- Public comments and unrestricted direct messaging.
- Platform-held funds, escrow, wallet, transfers, or investment execution.
- Real funding/investment facilitation before specialist legal review.
- Automated high-impact moderation without human review.

## 8. Acceptance test baseline

- Unauthenticated requests cannot read product data.
- Non-authorized members cannot access private/limited ideas via feed, search, direct URL, API, export, notification, or attachment.
- Free Studio works with AI disabled and without paid-provider credentials.
- Paid body is absent from free detail payload; forged client purchase state grants no access.
- Duplicate provider events are idempotent; refunds follow documented entitlement rules.
- No match/contact disclosure occurs after only one party consents.
- Blocked users cannot initiate new interactions.
- Operator actions are audited and moderation/verification data is restricted.
- Account deletion revokes sessions and follows retention rules.
- Variable-cost integrations have quotas, rate limits, and alerting before activation.


## 10. Security and activation gates

The feature requirements in this document must be implemented and tested against the [Authorization and Privacy Matrix](AUTHORIZATION-AND-PRIVACY-MATRIX.md), [Matching State Machine](MATCHING-STATE-MACHINE.md), [Paid Content Transaction Model](PAID-CONTENT-TRANSACTION-MODEL.md), and [Security Baseline](SECURITY-BASELINE.md).

- Product routes requiring authentication is not enough: every API, resource, search result, preview, notification, export and file download must enforce server-side authorization.
- Matching must not become established until both parties explicitly consent to the same immutable terms version and a single atomic server transaction confirms eligibility.
- Paid access must not be granted by a browser redirect or client flag; only a verified and reconciled provider event may create the purchase/entitlement state.
- Real-user activation is blocked until negative security tests, incident response ownership, backup restore tests, monitoring, feature kill switches and the relevant business/legal gates pass.
- The static prototype is not evidence that authentication, privacy, payment, consent, or security controls are implemented.
