# PON — Authorization and Privacy Matrix

- Status: Proposed normative design; review required before backend implementation
- Updated: 2026-10-16
- Scope: Product app only. Promotional site is separate.
- Rule: deny by default. UI visibility is never an authorization control.

## 1. Principal classes

| Principal | Rights and boundary |
|---|---|
| Anonymous visitor | Public promotional site only; no product data or APIs |
| Authenticated member | Data explicitly shared with that member |
| Idea owner | Own drafts and published ideas, subject to moderation and transaction-record constraints |
| Entitled reader | Paid content/version granted by a valid server-side entitlement |
| Match participant | Only the relevant match and its explicitly consented disclosure scope |
| Moderator | Minimum content needed for a documented case; access audited |
| Commerce operator | Transaction/support metadata; no automatic access to full paid bodies |
| Security administrator | Security operations; no automatic routine content access |

Roles can overlap. Evaluate role and resource ownership independently. Never trust a client-supplied role, owner ID, payment status, price, verification status, or match state.

## 2. Visibility semantics

| Visibility | Owner | Other signed-in members | Match participant | Anonymous |
|---|---|---|---|---|
| Community | Full owner view | Published free/community-visible portion | Same ordinary rights unless a separate disclosure grant exists | No product access |
| Limited | Full owner view | Deny unless explicitly granted by a defined audience mechanism | No automatic access; explicit grant required | No product access |
| Private | Full owner view | Deny | Deny unless owner creates a separate scoped disclosure grant | No product access |

- “Limited” must mean a precise audience model before implementation: named members, invitation, group, or another explicitly specified mechanism.
- A match never overrides idea visibility automatically. A separate MatchDisclosureGrant must specify fields/files, recipient, purpose, consented terms version, grant time, and revocation.
- Visibility changes affect future reads after commit. Previously copied/downloaded material cannot reliably be recalled; explain this limitation.
- APIs, feeds, search, counts, previews, exports, attachments, caches, and notifications must apply the same authorization policy.
- Titles, snippets, Open Graph metadata, notification text, and search counts must not leak limited/private content or paid text.

## 3. Resource/action matrix

Legend: Allow only under stated conditions; Scoped means minimum necessary fields; Deny means no access.

| Resource | Anonymous | Member | Owner | Entitled reader | Match participant | Operations |
|---|---|---|---|---|---|---|
| Feed/search | Deny | Community-visible metadata/content | Own plus community-visible | Same plus entitled version | Same plus explicit disclosure | Scoped and audited |
| Draft idea | Deny | Deny | Allow | Deny unless also owner | Deny unless explicit grant | Case-scoped, audited |
| Limited/private idea | Deny | Deny by default | Allow | No automatic grant | Explicit disclosure grant only | Case-scoped, audited |
| Paid body | Deny | Deny before entitlement | Allow | Granted version only | No automatic grant | Minimum need, audited |
| Purchase/receipt | Deny | Own records only | Own records only | Own entitlement only | No additional rights | Scoped commerce support |
| Match request | Deny | Own and addressed requests | Same | No additional rights | Associated request/match only | Scoped case/support |
| Match private details | Deny | Deny | Deny unless participant | Deny unless participant | Agreed disclosure only | Scoped and audited |
| Verification status | Deny | Own status | Own status | No additional rights | Only approved status/badge if policy permits | Minimum operational access |
| Reports/blocks | Deny | Own submissions and blocks; never another reporter’s identity | Same | Same | Same | Case-scoped |
| Audit events | Deny | Deny | Deny | Deny | Deny | Security-authorized roles only |

## 4. Mandatory enforcement

1. Authenticate every product API request and authorize every resource read/write on the server.
2. Centralize policy checks, e.g. canReadIdea(actor, idea, context) and canReadPaidVersion(actor, version). Avoid inconsistent inline checks.
3. Use actor-scoped queries where practical. Opaque IDs do not prevent IDOR/BOLA.
4. Derive owner, actor, price, payment, verification, consent and match state server-side. Reject or ignore client-supplied authoritative fields.
5. Apply the same rules to search, counts, previews, exports, files, notifications and caches.
6. Issue short-lived scoped download URLs only after authorization. Never put private/paid assets in public static storage or permanent public URLs.
7. Use private/no-store cache policies for sensitive responses; invalidate relevant caches after visibility, block, deletion, entitlement or consent changes.
8. A block prevents new requests/contact and applies the approved discovery policy. Define suspension/closure behavior for existing matches.
9. Separate moderator, commerce and security privileges; use least privilege, case-scoped access, and audit actor, reason, resource and timestamp.
10. Never log secrets, session IDs/tokens, verification artifacts, or unnecessary private/paid content.

## 5. Grants are not interchangeable

- Paid entitlement does not grant matching permission.
- Match consent does not grant access to paid content.
- Identity verification does not grant access to unrelated resources.
- Match consent must refer to the same immutable terms version for both parties.
- Revocation affects future access under the approved policy; it cannot erase copies already obtained or records that must lawfully be retained.

## 6. Required negative tests

- Anonymous requests to every product API/direct route are denied.
- Member A cannot read/update/delete Member B’s draft, idea, artifact, purchase, report or match by substituting IDs.
- Non-entitled users cannot obtain paid content from API, HTML, source maps, search, metadata, files, exports, caches or logs.
- Visibility changes, blocks, entitlement revocation and match closure invalidate future reads as specified.
- Match participants see only agreed fields; unrelated private profile fields remain hidden.
- Forged owner_id, role, price, is_paid, is_verified, is_matched, payment_status or consent fields grant no privilege.
- Moderator access is case-scoped and audited.
- Concurrent visibility and entitlement changes cannot produce unauthorized reads.

## 7. Decisions required before implementation

Define the exact limited-audience model; post-purchase access after edits/deletion/suspension; match disclosure fields; block behavior for active matches; moderator access and retention policy; and legal retention periods for transaction, consent, abuse and security evidence.
