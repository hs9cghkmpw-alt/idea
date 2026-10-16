# PON — Data Model and API Design

- Status: Draft for technical review
- Updated: 2026-10-16
- Purpose: Provider-neutral logical model before backend selection; not a database migration.

## 1. Design rules

1. Server is authoritative for identity, visibility, payment, entitlement, and match consent.
2. Every user-owned record has owner/actor references and timestamps.
3. Use opaque IDs; sequential IDs are not security controls.
4. Store money as integer minor units plus ISO currency code; never use floating point for monetary arithmetic.
5. Store timestamps in UTC.
6. Keep secrets and payment credentials server-side.
7. Keep paid bodies and private attachments out of public/static asset storage.
8. Authorize before returning search results, counts, snippets, or notification previews.
9. Audit material state changes without copying sensitive content into logs.
10. API contracts should be reusable by a future mobile client.

## 2. Logical entities

### Account
- id
- email/provider subject (abstract provider-specific identity)
- status: pending_verification, active, suspended, deletion_pending, deleted
- email_verified_at (nullable)
- created_at, updated_at, last_authenticated_at, deleted_at (nullable)
- Do not store plaintext passwords when delegated authentication is used.

### MemberProfile
- account_id
- display_name
- avatar_reference (optional)
- bio (optional)
- profile_visibility
- created_at, updated_at

### Idea
- id, owner_account_id
- title, summary, free_body
- category_id, tags
- visibility: community, limited, private
- lifecycle: draft, published, archived, removed
- moderation_state: normal, under_review, restricted, removed
- paid_section_enabled
- created_at, updated_at, published_at, version
- Keep paid body out of the general idea response object.

### IdeaAccessGrant
- id, idea_id, grantee_account_id or grant_type
- granted_by_account_id, reason, created_at, revoked_at
- Grant target must be explicit and auditable. Limited-visibility semantics remain open.

### StudioArtifact
- id, owner_account_id, linked_idea_id (nullable)
- template_key, content_json (validated schema/version), visibility
- created_at, updated_at
- Never accept arbitrary executable HTML. Version the template/content schema.

### PaidContent
- id, idea_id, creator_account_id
- paid_body_reference or protected_body
- price_minor, currency
- status: draft, active, suspended, retired
- terms_version, created_at, updated_at
- Price changes must not silently alter an existing purchase's terms.

### Purchase
- id, buyer_account_id, paid_content_id
- provider, provider_transaction_reference
- amount_minor, currency
- state: initiated, pending, paid, refunded, disputed, failed
- idempotency_key, created_at, confirmed_at, updated_at
- Enforce uniqueness for provider transaction references and idempotency keys in their relevant scope.

### Entitlement
- id, account_id, resource_type, resource_id, source_purchase_id
- state: active, revoked, expired
- granted_at, revoked_at, expires_at
- Check server-side before returning paid content.

### MatchRequest
- id, requester_account_id, recipient_account_id
- idea_id (nullable), request_type, message
- proposed_scope_version
- state: pending, withdrawn, declined, accepted_for_consent, expired, matched, closed
- created_at, updated_at, expires_at

### MatchConsent
- id, match_request_id, account_id, terms_version
- consent_state: accepted, withdrawn
- consented_at, withdrawn_at
- Match is active only when both required parties accepted the same terms version.

### Match
- id, match_request_id
- state: active, closed, blocked, under_review
- created_at, closed_at
- Create only after server validates mutual consent.

### VerificationStatus
- id, account_id, provider
- status: not_started, pending, verified, failed, expired
- method, provider_reference (only if necessary), checked_at, expires_at
- Never store ID-document or My Number images.

### Report
- id, reporter_account_id, target_type, target_id
- reason_code, description
- state: submitted, triaged, actioned, dismissed, appealed
- created_at, resolved_at

### Block
- blocker_account_id, blocked_account_id, created_at
- Unique pair constraint; product policy must define directionality.

### ModerationAction
- id, operator_account_id, target_type, target_id
- action_type, reason_code, internal_note_reference, created_at
- Privileged actions must be audited.

### AuditEvent
- id, actor_account_id (nullable for system event)
- event_type, target_type, target_id
- metadata (allowlisted, non-sensitive fields only), created_at
- Never log passwords, tokens, raw payment data, identity documents, or full private idea bodies.

## 3. Relationships

- Account 1:1 MemberProfile; Account 1:N Idea.
- Idea 1:N StudioArtifact (optional linkage).
- First model assumes one optional PaidContent section per idea; multiple sections require a later schema decision.
- Account 1:N Purchase; purchase grants entitlement according to resource type.
- MatchRequest 1:N MatchConsent; MatchRequest 0:1 Match.
- Account 1:N Report, Block, VerificationStatus, AuditEvent.

## 4. API conventions

- Proposed base path: /api/v1
- JSON by default; file uploads use a separate protected upload flow.
- Authentication/session strategy is pending provider selection.
- Cookie-authenticated state-changing requests require CSRF protection.
- Validate request schemas server-side and return a consistent error envelope: code, safe message, optional field errors, request_id.
- Use cursor pagination; avoid unrestricted full-table reads.
- Use idempotency keys for purchases and other non-repeatable operations.
- Use optimistic concurrency/version checks for content edits and match terms.

## 5. Proposed endpoints

### Authentication (provider-dependent)
- POST /api/v1/auth/register
- POST /api/v1/auth/session
- DELETE /api/v1/auth/session
- POST /api/v1/auth/recovery
- These may be owned by an authentication provider; avoid duplicating provider features unnecessarily.

### Discovery and ideas
- GET /api/v1/ideas?cursor=&category=&q=
- POST /api/v1/ideas
- GET /api/v1/ideas/{ideaId}
- PATCH /api/v1/ideas/{ideaId}
- POST /api/v1/ideas/{ideaId}/publish
- POST /api/v1/ideas/{ideaId}/archive
- DELETE /api/v1/ideas/{ideaId}
- Every read endpoint enforces visibility and moderation rules.

### Studio
- POST /api/v1/studio/artifacts
- GET /api/v1/studio/artifacts/{artifactId}
- PATCH /api/v1/studio/artifacts/{artifactId}
- POST /api/v1/studio/artifacts/{artifactId}/copy-to-idea
- Future AI actions require explicit endpoints, quotas, and metering; never expose provider keys in the client.

### Paid content
- POST /api/v1/ideas/{ideaId}/paid-content
- PATCH /api/v1/paid-content/{paidContentId}
- POST /api/v1/paid-content/{paidContentId}/purchase-intents
- POST /api/v1/webhooks/payments/{provider}
- GET /api/v1/paid-content/{paidContentId}/body
- GET /api/v1/me/purchases
- These endpoints remain disabled until provider, policy, and cost approval. Webhooks require signature verification.

### Matching
- POST /api/v1/match-requests
- GET /api/v1/match-requests/incoming
- GET /api/v1/match-requests/outgoing
- POST /api/v1/match-requests/{requestId}/withdraw
- POST /api/v1/match-requests/{requestId}/decline
- POST /api/v1/match-requests/{requestId}/accept-for-consent
- POST /api/v1/match-requests/{requestId}/consents
- GET /api/v1/matches/{matchId}
- Server creates Match only after both parties accepted identical terms.

### Trust and account
- POST /api/v1/reports
- POST /api/v1/blocks
- DELETE /api/v1/blocks/{accountId}
- GET /api/v1/me
- PATCH /api/v1/me/profile
- POST /api/v1/me/deletion-requests
- Operator endpoints require a separately authorized namespace and are not specified here.

## 6. Authorization matrix

| Resource/action | Owner | Other member | Purchaser | Match participant | Moderator |
|---|---|---|---|---|---|
| Community idea free body | Read/edit own | Read if published and not restricted | Same as member | Same as member | Read only for authorized case |
| Limited idea | Read/edit own | Deny unless grant | Deny unless grant | Read only if grant policy permits | Read only for authorized case |
| Private idea | Read/edit own | Deny | Deny unless separately granted | Deny unless separately granted | Read only for authorized case |
| Paid body | Read/manage own | Deny without entitlement | Read with active entitlement | No automatic entitlement | Access only if needed and audited |
| Match request | Read/respond by participant role | Deny | No special rights | Read within participant scope | Limited case access, audited |
| Verification metadata | View own status | Deny | Deny | No automatic access | Restricted operational access |
| Report details | View own submission status | Deny | Deny | Deny | Authorized moderation access |

Owner authoring APIs and reader APIs should remain distinct.

## 7. Security-critical tests

1. Anonymous request to every product API is rejected.
2. Member A cannot read Member B's private/limited idea by guessing an ID.
3. Search results and snippets never reveal unauthorized ideas.
4. Paid body is absent from free detail payload and cannot be fetched without active entitlement.
5. Forged client purchase success or price cannot grant entitlement or alter price.
6. Duplicate payment webhooks are signature-verified and idempotent.
7. Match cannot be created without mutual consent to identical terms.
8. Contact data is not returned before required consent/verification.
9. Blocked accounts cannot create new match requests against each other.
10. Moderation and verification data are inaccessible to ordinary members.
11. Account deletion revokes sessions and follows retention rules.
12. Logs contain no credentials, raw identity data, or unnecessary private content.

## 8. Decisions before schema freeze

- Visibility terminology and Limited-grant semantics.
- One or multiple paid sections per idea.
- Studio artifact storage and allowed content schema.
- Purchase/subscription model, creator payout, refunds.
- Match lifecycle, expiry, and contact-disclosure policy.
- Verification provider and metadata retention.
- Authentication/session provider.
- Data retention/deletion matrix and audit retention.
- Hosting/database/object storage providers and operating-cost ceiling.
