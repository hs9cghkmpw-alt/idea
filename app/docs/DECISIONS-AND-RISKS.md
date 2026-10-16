# PON — Design Decisions and Risk Register

- Status: Working design baseline
- Updated: 2026-10-16
- Scope: Web-first product; promotional site remains separate

## 1. Confirmed decisions

| ID | Decision | Design consequence |
|---|---|---|
| D-01 | Account-based service; login required even to browse | All product routes and APIs require authentication. The promotional site remains public and separate. |
| D-02 | Initial scope includes idea posting/browsing, Free Studio, paid content, and matching | Define end-to-end flows and server-side rules for all four domains. Implementation may be staged by cost and risk. |
| D-03 | Design paid functionality now; implement after operating-cost estimation | Design entitlements, limits, provider-neutral interfaces, and upgrade paths. Do not publish prices or imply unavailable features exist. |
| D-04 | Free Studio must be useful without real AI | Template-based manual structuring is the baseline; paid AI may improve depth and output quality later. |
| D-05 | Promotional site and product app are separate | Do not couple LP releases to app releases. Current repository only separates directories; dedicated repository split remains pending. |
| D-06 | Web first, mobile app later | Responsive UI and reusable API/domain rules; do not build native apps prematurely. |
| D-07 | Matching requires mutual consent | One-sided interest is a pending request, not a match. Contact details remain gated until consent conditions are met. |
| D-08 | PON does not hold, receive, escrow, transfer, distribute, or execute funds | No wallet or matched-funding payment flow. Paid-content commerce is a separate domain. |

## 2. Recommended working defaults (not final product-owner decisions)

- P-01: One account can be a reader, creator, purchaser, and matching participant; capabilities are permissions, not separate account types.
- P-02: All idea content is accessible only to authenticated members, subject to visibility rules.
- P-03: Visibility modes: Community (all logged-in members), Limited (explicitly granted accounts and/or eligible match participants), Private (owner only). Final labels and grant semantics remain open.
- P-04: Paid content uses a free preview plus an optional paid section.
- P-05: Design one-time purchase first. Subscription/membership remains an extension point pending cost and policy review.
- P-06: Matching is a structured consent workflow. Open direct messaging is not assumed in the first release.
- P-07: Reporting, blocking, moderation, and account deletion are launch requirements.
- P-08: External identity verification may be required before matching/contact disclosure. PON should retain minimal verification metadata, not identity-document images.

## 3. Unresolved decisions

### Product and access
- Exact visibility labels and whether Limited grants apply to named accounts, match participants, or both.
- What happens to purchases and active matches if visibility changes after publication.
- Whether bookmarks, creator follows, notifications, comments, and direct messages ship at launch.
- Whether Studio artifacts are embedded in ideas, attached as files, or stored separately.

### Account and trust
- Authentication provider, email verification, recovery, session expiry, and optional MFA.
- Whether account display names may be pseudonymous.
- Age eligibility and rules for minors.
- Account deletion, retention, backups, exports, and legal holds.
- Moderation staffing, response targets, appeals, and repeat-offender policy.
- Identity-verification provider, trigger, price, and failure/retry policy.

### Paid content and costs
- One-time purchase vs subscription at launch.
- Platform fee, creator share, payment processing, refunds, chargebacks, taxes, and payout eligibility.
- Price limits, currency, free-preview rules, and treatment of edits after purchase.
- Hosting, database, storage, email, monitoring, payment, identity, support, and AI cost ceiling.
- Paid Studio pricing, AI provider/model, quotas, retention, and data-use disclosure.

### Matching and legal
- Whether real matching ships at launch or is gated until legal/moderation readiness.
- Whether capital, loans, subsidies, fundraising, investment, or securities-related categories appear in the first release.
- Japanese legal review requirements for funding/investment-adjacent features and compensation.
- Exact contact data disclosed after mutual consent and whether verification is required first.
- Expiry, cancellation, withdrawal, blocking, and reporting behavior.

### Technical and operations
- Dedicated app repository and deployment target.
- Authentication, API, relational database, object storage, email, payment, and monitoring providers.
- Traffic assumptions, backup retention, recovery objectives, and support capacity.
- Data region, privacy notice, terms, commercial transaction disclosures, and incident response.

## 4. Risk register

| ID | Risk | Impact | Required control before production |
|---|---|---|---|
| R-01 | Login requirement creates onboarding friction | Lower registration and discovery | Keep registration short, explain account value, measure abandonment. |
| R-02 | Private/limited ideas leak through search, snippets, exports, or direct URLs | Critical confidentiality breach | Server-side authorization on every read path; deny-by-default tests; never rely on hidden UI controls. |
| R-03 | Paid body leaks through HTML, client state, or asset URLs | Revenue loss and creator trust damage | Protected content endpoint/storage; test direct URLs and cache bypass. |
| R-04 | Forged purchase state or repeated payment events | Unauthorized access or duplicate grants | Verified webhooks, idempotency, transaction ledger, reconciliation. |
| R-05 | Payouts, refunds, taxes, and chargebacks are undefined | Financial/legal exposure | No real commerce until accounting, policy, provider fees, and payout rules are reviewed. |
| R-06 | Matching is mistaken for a guaranteed deal or investment service | User harm and regulatory exposure | Clear boundaries, mutual consent, no funds handling, legal review before funding-related features. |
| R-07 | Harassment, scams, copied ideas, prohibited content | User harm and reputation damage | Report/block, moderation queue, sanctions, appeals, rate limits. |
| R-08 | Identity verification data is over-collected | Privacy and breach impact | Third-party verification; retain minimum status/method/time; never store ID or My Number images. |
| R-09 | AI costs or abuse become unbounded | Unexpected operating loss | Disable AI until costed; quotas, rate limits, usage metering, hard budgets. |
| R-10 | Static prototype is mistaken for a real service | Misleading users | Persistent demo labels; no fake payment, verification, persistence, or match success. |
| R-11 | Account deletion conflicts with purchases, matches, or backups | Privacy/legal conflict | Retention matrix and deletion tests before launch. |
| R-12 | Promo and product deployments become coupled | Accidental release risk | Separate build/deploy paths now; dedicated app repository before production. |

## 5. Release gates

Before real users are admitted:
1. Authentication and server-side authorization pass negative tests.
2. Visibility, paid entitlement, and match consent are enforced server-side.
3. Report/block/moderation, recovery, and deletion behavior are documented and tested.
4. Payment, refund, creator accounting, privacy notices, and terms are ready before real purchases.
5. Japanese legal review is complete before investment/funding-adjacent matching is enabled.
6. Backups, restore test, monitoring, incident response, and cost alerts are operational.
7. Prototype-only actions are replaced by real behavior or disabled.

## 6. Cost-estimation method

Estimate low / expected / high monthly scenarios:
- Fixed: hosting, database baseline, domain, logs/monitoring, email minimums.
- Usage-based: storage/bandwidth, email volume, payment fees, identity checks, AI usage, moderation/support.
- Risk reserve: refunds, chargebacks, abuse spikes, unexpected traffic.
- Operations: maintenance time, moderation hours, legal/accounting review.

State assumptions. Do not present a single number without usage estimates.


## 7. Normative design documents added (2026-10-16)

The following documents expand the draft decisions into reviewable rules. They remain proposals until product/policy gates are explicitly approved:

- [Authorization and Privacy Matrix](AUTHORIZATION-AND-PRIVACY-MATRIX.md) — role/resource permissions, visibility semantics, explicit grants, negative authorization tests.
- [Matching State Machine](MATCHING-STATE-MACHINE.md) — immutable terms versions, mutual consent, concurrency/replay protection, suspension and closure.
- [Paid Content Transaction Model](PAID-CONTENT-TRANSACTION-MODEL.md) — seller/provider gate, purchase/entitlement separation, refunds, versioning and reconciliation.
- [Security Baseline](SECURITY-BASELINE.md) — threat model, auth/session, data boundaries, infrastructure, incident response, recovery and release gates.

These documents do not imply the prototype implements these controls. Any real-user release remains blocked until server enforcement, negative tests, operational ownership and explicit release approval exist.
