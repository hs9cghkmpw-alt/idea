# PON — Screen Inventory and Navigation Flows

- Status: Detailed-design draft
- Updated: 2026-10-16
- Access rule: product-app browsing requires authentication; the promotional site remains separate and public.

## 1. Global navigation

Authenticated primary navigation:
1. Ideas / Discover
2. Create idea
3. Studio
4. Matching
5. My activity
6. Account / Settings

Contextual idea actions: view free preview and paid marker, save (launch decision pending), report, block creator, express interest, manage own idea, and purchase only when commerce is live.

Unauthenticated product routes redirect to sign-in and preserve a validated local return path. Sign-in, sign-up, verification, recovery, and the promotional site remain public routes.

## 2. Screen inventory

| ID | Screen | Purpose | Key states |
|---|---|---|---|
| AUTH-01 | Sign in | Authenticate member | Idle, validation error, loading, success, rate-limited |
| AUTH-02 | Create account | Register member | Invalid input, duplicate, verification pending, success |
| AUTH-03 | Verify/recover | Confirm email and recover access | Expired token, resend, success, error |
| DISC-01 | Idea feed | Discover eligible ideas | Loading, populated, empty, error |
| DISC-02 | Search/filters | Find ideas | No results, filters applied, error |
| IDEA-01 | Idea detail | Read accessible content | Published, archived, restricted, not found |
| IDEA-02 | Create/edit idea | Draft, preview, publish | Unsaved, validation error, save failure, published |
| STU-01 | Free Studio | Structure and visualize manually | Empty, editing, preview, saved |
| PAY-01 | Paid section/checkout | Explain locked content and purchase | Not available, pending, paid, failed, refunded |
| PAY-02 | Purchase library | Review purchases | Empty, populated, refunded/revoked |
| MATCH-01 | Matching discovery | Browse collaboration opportunities | Empty, filtered, unavailable, error |
| MATCH-02 | Express interest | Submit structured request | Draft, confirmation, pending, withdrawn |
| MATCH-03 | Incoming requests | Review requests | Pending, approved, declined, expired, reported |
| MATCH-04 | Mutual consent | Confirm shared scope | Awaiting other party, matched, withdrawn, expired |
| MATCH-05 | Match detail | View agreed scope/contact | Matched, closed, blocked, reported |
| TRUST-01 | Report/block | Report content or member | Submitted, duplicate, closed, error |
| USER-01 | Profile/settings | Manage display identity | Saved, validation error |
| USER-02 | Privacy/visibility | Manage idea visibility | Saved, blocked by purchase/match rules |
| USER-03 | Account deletion | Explain and confirm deletion | Confirmation, re-auth, pending, completed |
| CREATOR-01 | Creator dashboard | Manage ideas and paid sections | Empty, draft, active, suspended |
| OPS-01 | Moderation console | Review reports | Queue, in review, actioned, appealed |
| OPS-02 | Commerce/support console | Resolve purchase/refund cases | Pending, resolved, escalated |

Operator screens require separate privileged permissions. Commerce UI may remain disabled until real payments ship, but its states are designed now.

## 3. Key user flows

### A. Sign-up to discovery
1. User opens product route.
2. Unauthenticated user is redirected to sign-in/sign-up with a validated local return path.
3. User creates an account and completes any required verification.
4. Authenticated session is established.
5. User returns to intended route or the feed.
6. Every API request independently checks account status and permissions.

### B. Publish without Studio
1. Member selects Create idea.
2. Enters title, summary, body, category/tags, visibility, and optional paid-section settings.
3. Saves a draft.
4. Previews what an eligible reader would see.
5. Publishes after validation and policy acknowledgement.
6. Server records state and timestamps.
7. Idea is discoverable only to members authorized by visibility rules.

### C. Free Studio
1. Member opens Studio or starts from an idea draft.
2. Selects a template such as problem / idea / audience / value / next step.
3. Fills sections manually.
4. Previews the structured result.
5. Saves an artifact or copies content into an idea draft.
6. Future paid AI actions appear separately with explicit capability and price/limit disclosure. Private content is never sent to an AI provider silently.

### D. Paid content
1. Reader opens an idea detail page.
2. Server returns free content and paid-section metadata, not the restricted body.
3. UI shows price, included content, creator, terms, and purchase action only when commerce is live.
4. Payment provider processes checkout; server confirms through verified provider events.
5. Server grants entitlement only after confirmed payment.
6. Reader fetches paid body through an authorized endpoint.
7. Refund/chargeback updates entitlement according to published policy and is recorded in the ledger.

### E. Matching
1. Member views a matching-enabled idea/opportunity.
2. Member submits purpose, proposed contribution, and relevant non-sensitive details.
3. Recipient reviews the request.
4. Recipient may decline, ask for clarification, or accept moving to mutual-consent stage.
5. Both parties review the same scope and information-disclosure terms.
6. Match is created only after both consent.
7. Contact details are shown only under the consent and verification policy.
8. Report/block/withdrawal/closure actions remain available according to defined rules.

### F. Report and block
1. Member reports an idea, account, or match with a reason and optional explanation.
2. Server stores the report with restricted operator access.
3. Reporter receives confirmation, not a promise of a specific outcome.
4. Moderator reviews and applies no action, warning, restriction, removal, or escalation.
5. Blocking prevents new interaction and hides/limits content under the published policy.
6. Appeals and repeat reports link to the moderation case.

### G. Account deletion
1. Explain what is deleted, retained, anonymized, and how purchases/matches are affected.
2. Require re-authentication for the destructive action.
3. Revoke sessions and prevent new activity.
4. Delete/anonymize profile data according to the retention matrix.
5. Handle purchase, financial, moderation, and match records under separately defined retention rules.
6. Confirm completion only after the workflow actually completes.

## 4. Authorization and UX rules

- Hiding a button is not access control. Every API checks authentication, account status, resource visibility/ownership, and action permission.
- Search results, counts, snippets, notifications, exports, thumbnails, and direct asset URLs obey the same visibility rules as the detail page.
- Errors must not reveal whether a private idea exists to an unauthorized member.
- Payment state and match state come from the server, never client flags.
- Clearly distinguish “interest sent”, “accepted for mutual consent”, and “match established”.
- Confirm before publishing, buying, disclosing contact details, or deleting an account.
- Preserve unsaved work where feasible and warn before leaving dirty forms.
- Provide keyboard accessibility, labels, readable contrast, responsive layout, and clear loading/empty/error states.
- Display persistent prototype labels until real functionality is implemented.

## 5. Screen-level decisions still open

- Registration fields and email-verification requirement.
- Visibility labels and how named-member grants are selected.
- Bookmarks, comments, notifications, and direct messaging in launch scope.
- Studio artifact storage and export.
- Checkout provider, subscription scope, refunds, and creator payout.
- Whether real matching is launch-enabled or feature-flagged pending legal/moderation readiness.
- Exact contact data released after match and whether external verification is required first.
