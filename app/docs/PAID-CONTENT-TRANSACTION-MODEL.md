# PON — Paid Content Transaction Model

- Status: Proposed business/technical model; not legal, tax or provider approval
- Updated: 2026-10-16
- Initial candidate: one-time purchase. Subscription/membership is a later extension, not an assumed launch feature.

## 1. Separate records and responsibilities

Model these separately:
1. Offer: content/version, seller model, price, currency, disclosure and availability.
2. Checkout attempt: initiated provider checkout; not proof of payment.
3. Provider transaction/event: authoritative provider reference and verified event.
4. Purchase: PON business record linking buyer, offer/version, amount and state.
5. Entitlement: server-side permission to read a defined scope/version.
6. Refund/dispute: separate financial state and evidence.
7. Creator proceeds/platform fee/settlement: accounting obligations; do not imply they exist until provider and seller models are approved.

## 2. Business/legal gate

Before selecting a provider or enabling checkout, decide:
- Legal seller/merchant: PON, creator, or provider-managed connected seller.
- Who issues receipts/invoices and handles consumption tax, income reporting, support, refunds, chargebacks, fraud and complaints.
- Whether provider supports the chosen marketplace model, seller onboarding/KYC, split settlement and Japan operations.
- Platform fee calculation/disclosure, creator proceeds, payout timing/minimum, reserves, negative balances and payout failures.
- PON does not itself hold, escrow, transfer or distribute user funds. A provider marketplace payout model still needs provider and legal review.
- Terms, commercial disclosures including applicable Japanese Specified Commercial Transactions Act duties, privacy policy, creator agreement, prohibited content, refund policy, and tax/accounting review.
- Equity investment, securities solicitation, lending intermediation, or capital-raise success fees require specialist Japanese legal review. “PON does not hold funds” alone is not a regulatory safe harbor.

**Gate:** checkout remains disabled until a decision names seller model, provider, support/refund owner, fees/payout rules, accounting owner, legal reviewer and approved terms.

## 3. Suggested purchase lifecycle

Conceptual purchase state: checkout_pending → paid_pending_verification → paid → refunded/disputed/cancelled/failed. Keep provider transaction status separate from purchase status.

- Checkout initiation and browser success redirect do not grant entitlement.
- Only verified server-to-server provider events may change payment state.
- Verify authenticity/signature, provider account/environment, order reference, amount, currency, and expected state; retrieve provider-side transaction details where appropriate.
- Store unique provider event IDs and process idempotently. Handle late, duplicate, replayed and out-of-order events.
- A refund/dispute never deletes purchase or audit evidence; access changes only under disclosed policy.
- Reconcile provider transactions against PON records on a schedule.

## 4. Entitlement rules

- Entitlement is a server-side grant. Every protected read checks it.
- Record buyer, offer/content, granted version or version policy, source purchase, status, and effective/revoked times.
- Never send paid body to the browser before entitlement is confirmed. Keep paid text out of static HTML, source maps, metadata, previews, caches, analytics and public object storage.
- Keep free preview and paid body as separate protected resources.
- Use short-lived scoped download URLs only after authorization.
- Enforce DB uniqueness/transactional checks against duplicate purchases. Recommended default: disallow self-purchase.
- Client cannot set paid/refunded state, price, buyer/seller, entitlement status, or provider transaction ID.

## 5. Versioning, deletion and refunds

Recommended policy for approval:
- Each published paid body is an immutable PaidContentVersion with content hash and publication time.
- Checkout snapshots the exact offered version, price, currency and terms.
- Define whether typo fixes are included. Material changes require disclosure and may require renewed purchase/consent.
- Recommended starting policy: buyers retain access to the purchased version and clearly described corrections/updates; do not silently substitute a materially different product.
- Unpublishing blocks new purchases but does not automatically erase purchase, tax, refund, dispute or audit evidence. Existing access/refund rights need an explicit policy.
- Refunds must use the provider’s authoritative refund flow; a local UI flag does not mean money was returned.
- Specify full/partial refunds, chargebacks, fraud, disputes and account suspension effects on access.
- Never retroactively alter an existing purchase’s price.

## 6. Minimum logical entities

| Entity | Minimum fields/constraints |
|---|---|
| PaidOffer | owner, content ID, status, current version, integer-minor-unit price, ISO currency, terms version, timestamps |
| PaidContentVersion | offer ID, immutable version number, protected body/object reference, content hash, published timestamp |
| CheckoutAttempt | opaque ID, buyer, offer/version, amount/currency snapshot, provider session reference, status, expiry, idempotency key |
| ProviderEvent | provider, unique provider event ID, received/verified times, processing status, minimal payload/reference, result |
| Purchase | buyer, seller/merchant model, offer/version, amount/currency snapshot, provider transaction reference, state, timestamps |
| Entitlement | buyer, offer/version policy, source purchase, status, effective/revoked times |
| RefundOrDispute | purchase, provider reference, amount/currency, status, reason category, timestamps, actor |
| SettlementLedgerEntry | immutable amount/currency/type/reference entries for fees, proceeds, refunds and adjustments, only if required by chosen model |

Use integer minor units plus ISO currency; never floating point for money. Define DB constraints and transaction boundaries before migrations.

## 7. API and event safety

- Create checkout server-side using current DB offer and seller data; never trust client-supplied amount/currency.
- Verify webhook signatures with the provider’s official method and raw request bytes when required; reject invalid signatures and enforce replay controls supported by the provider.
- Persist event ID and processing status; retry idempotently with dead-letter/reconciliation procedures.
- Use transactional outbox or equivalent for post-commit notifications/entitlement events.
- Never log card details, webhook secrets, authentication tokens or unnecessary provider PII.
- Separate sandbox/production credentials and endpoints; rotate secrets and use least privilege.
- Alert on mismatched amount/currency, unknown events, stuck pending purchases, repeated failures and settlement differences.

## 8. Required negative tests

- Forged success redirect grants no entitlement.
- Invalid, duplicate, replayed or out-of-order webhook cannot duplicate purchase/entitlement.
- Wrong amount, currency, merchant, environment, buyer, offer or order reference is rejected and alerted.
- Non-buyer/unauthenticated users cannot read paid bodies or files.
- Refund/dispute follows documented access policy without deleting financial evidence.
- Offer price/version changes during checkout do not alter transaction snapshot.
- Concurrent checkout attempts obey uniqueness and idempotency constraints.

## 9. Release gate

Keep paid checkout disabled until seller/payment/refund/tax decisions, provider integration, webhook verification, reconciliation, creator accounting, support procedures, authorization tests and legal review pass staging tests. Pricing/revenue share remain undecided pending operating-cost and legal review.
