# PON — Matching State Machine and Consent Rules

- Status: Proposed normative design; policy approval required before implementation
- Updated: 2026-10-16
- Principle: interest is not consent; acceptance of a request is not a completed match.

## 1. States

| State | Meaning | Transition authority |
|---|---|---|
| draft | Not submitted | Creator |
| pending_recipient | Submitted; recipient has not decided | Creator may withdraw; recipient may decline |
| terms_proposed | Discussion accepted in principle or revised terms proposed | Either participant may propose a new version |
| awaiting_mutual_consent | Immutable terms presented for explicit consent by both parties | Each party consents to that exact version or withdraws |
| matched | Both consented to the same current version and checks passed | System transaction only |
| declined | Recipient declined | Terminal |
| withdrawn | Request/participation withdrawn under policy | Authorized participant |
| expired | Deadline passed | Idempotent system transition |
| suspended | Safety, report, block, verification or operational hold | Authorized safety operator/system rule |
| closed | Match ended | Either participant or authorized safety operator |

Terminal states: declined, withdrawn, expired, closed. Suspended blocks new contact and disclosure; it must not reactivate silently.

## 2. Canonical flow

1. Creator submits recipient, category, purpose, requested contribution, indicative amount/range if relevant, scope and expiry.
2. Server checks self-match, account status, blocks, category policy, rate limits and verification requirements.
3. Recipient may decline or accept further discussion. This does not create a match or unlock private details.
4. Either party may propose revised terms. Every proposal creates an immutable version and increments terms_version.
5. Both parties receive the same immutable terms version and must explicitly confirm it. Silence, viewing, “interested”, or earlier consent is not consent.
6. Establish matched atomically only when both valid consent records reference the current version, neither has withdrawn, both accounts remain eligible, no block/suspension/expiry applies, and required checks pass.
7. Only after commit may the system grant the listed disclosure/contact permissions.
8. Withdrawal/closure disables future contact and disclosure according to the approved policy; required audit evidence is retained.

## 3. Transition rules

| From | Event | To | Required behavior |
|---|---|---|---|
| draft | Submit | pending_recipient | Validate; notification must not leak private content |
| pending_recipient | Decline | declined | Record actor/time; no disclosure |
| pending_recipient | Accept discussion | terms_proposed | No private details/contact unlocked |
| pending_recipient or terms_proposed | Revise terms | terms_proposed | Increment version; invalidate prior-version consents |
| terms_proposed | Present final terms | awaiting_mutual_consent | Freeze terms and digest/version |
| awaiting_mutual_consent | One party consents | Same | Record consent; no match yet |
| awaiting_mutual_consent | Both consent current version | matched | One transaction; verify eligibility again |
| Pre-match non-terminal | Withdraw/expire | withdrawn/expired | Idempotent; invalidate pending consent |
| matched | Report/block/safety trigger | suspended | Immediately prevent new disclosure/contact pending review |
| matched or suspended | Close | closed | Disable future contact/disclosure |
| suspended | Resolve | Explicit reviewed transition | Audit decision and revalidate all conditions |

Do not expose a generic status PATCH. Use event-specific commands with server-side transition validation.

## 4. Consent evidence

Each consent record includes request ID, actor account ID, terms_version, immutable terms digest, decision, server timestamp, policy version shown, and an audit-safe session/context reference that contains no session secret. Use either a unique effective decision per actor/version or an append-only event model with deterministic current state.

Consent for version N never satisfies version N+1. Server time is authoritative. Terms shown to a user must be the terms recorded for that consent.

## 5. Concurrency, replay and expiry

- Establish matched in a DB transaction with row locking or compare-and-swap against current version/state.
- Enforce uniqueness for active participant pairs according to policy; prevent self-matching.
- Use idempotency keys for retryable mutations to prevent duplicate requests, consent records, notifications and matches.
- Expiry jobs compare current state/version and are idempotent.
- Never match expired, withdrawn, suspended, blocked, or ineligible accounts.
- Publish notifications via a transactional outbox/durable queue after commit.
- Record state transitions in an append-only event/audit log not writable by client APIs.

## 6. Disclosure boundary

A match never unlocks the whole account. Each match has a disclosure manifest listing exact fields/files, recipient, purpose, terms version, grant time and revocation/closure time.

Initial launch recommendation: no unrestricted direct messaging. Start with structured requests and explicitly consented disclosure/contact fields. If messaging is added later, first implement reporting, blocking, rate limits, retention rules and moderation operations.

## 7. Abuse and legal controls

- Rate-limit request creation and repeated invitations by account and appropriate network signals.
- Provide cooldowns and recipient controls; check blocks at creation and delivery.
- Avoid revealing whether a private account or block exists through distinguishable responses.
- Reports/blocks can suspend an active match immediately pending review.
- Investment, loan, equity and other potentially regulated categories remain disabled until jurisdiction-specific legal review and an operational owner approve them.

## 8. Policy decisions required

Set request expiry; whether submitted requests can be edited or must be superseded; whether declined requests can be reissued; post-match withdrawal/closure behavior; exact disclosure manifest; on-platform versus exchanged contact; category-specific verification; and retention of consent/audit evidence.
