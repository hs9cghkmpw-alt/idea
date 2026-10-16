# PON Web App — Architecture Overview

- Status: Draft for review
- Updated: 2026-10-16
- Scope: Product and system architecture; not yet an implementation contract

## 1. Purpose

PON is a place where people can publish, discover, understand, develop, and circulate ideas. It must support everyday ideas as well as business concepts. It is not primarily an investment proposal generator or an investment platform.

Design principle: keep idea sharing useful on its own. Studio, paid content, and matching are optional capabilities rather than gates to participation.

## 2. Product surfaces

1. Promotion site: explains the service and communicates its value proposition. It is a separate product surface and should not be coupled to app releases.
2. Web app: first product surface, designed for responsive desktop and mobile browsers.
3. Future native/cross-platform mobile apps: considered later, after the Web MVP validates the core experience.
4. Backend services: authoritative storage, permissions, business rules, and integrations once the prototype becomes a real service.

Current repository separation is by directory only. A dedicated app repository is still an open operational decision.

## 3. User groups

- Visitor: access the separate public promotional site; cannot browse product-app ideas until authenticated.
- Member: create and manage ideas, save/bookmark, interact with supported features.
- Creator: optionally configure paid content or membership, if/when monetization ships.
- Matching participant: express interest and approve/decline a proposed match.
- Moderator/operator: handle reports, policy violations, account/content actions, and service operations.

These are conceptual roles. The first release may combine roles in one account; permissions must be explicit rather than inferred from the UI.

## 4. High-level system context

User browser / future mobile client
→ Web UI
→ Application API (authoritative business rules)
→ Database and object storage

Optional external services, only when needed:
- Authentication provider
- Email/notification provider
- AI provider for paid Studio
- Payment provider for paid content/subscriptions
- Third-party identity verification for gated matching/discussion
- Logging, monitoring, and error reporting

The browser must not be trusted to enforce permissions, prices, payment status, matching consent, or visibility. Those rules belong on the server.

## 5. Core functional domains

### A. Discovery
- Authenticated-member feed
- Search and category filtering
- Idea detail page
- Basic sort order; advanced ranking deferred until there is usage data

### B. Idea publishing and lifecycle
- Draft and preview
- Publish, edit, unpublish/archive, delete according to defined policy
- Tags/category and visibility setting
- Report content and moderation states
- Posting must not require Studio

### C. Studio
- Free template-based structuring and visualization
- Optional export/share artifact if included in MVP
- AI-assisted refinement, diagrams, and documents are later capabilities
- AI usage needs quotas, abuse controls, privacy disclosure, and cost limits
- The prototype's template logic is not a real AI integration

### D. Paid content
- Optional free preview and paid section
- Individual purchase and/or subscription are candidates, not finalized
- Entitlements must be verified server-side
- Creator revenue share, refunds, fees, tax handling, and payment provider are undecided

### E. Matching
- Possible types: co-development, business partnership, talent/technical support, distribution, and information about capital/loans/subsidies
- Flow: browse → express interest → recipient reviews → both consent → match created → agreed contact/details become available
- One-sided interest is not a match
- Withdrawal is possible before match completion
- Store consent timestamps and state transitions
- Matching must not imply that PON guarantees the project, parties, funding, or outcomes

### F. Trust and safety
- Report, block, moderation review, and appeal/escalation policy to be designed
- Anonymous/unverified idea posting may be allowed
- Matching or discussion may require external verification
- If verification is used, retain only the minimum verification result metadata; do not store ID document or My Number images
- Public/limited/private access must be enforced and tested on the server before launch

## 6. Non-functional requirements

- Responsive and keyboard-accessible UI
- Clear loading, empty, success, and error states
- Server-side authorization for every private operation
- Input validation and output escaping
- Rate limits and abuse controls for posting, search, messaging, and AI
- Audit trail for important moderation, payment, and match state changes
- Backup and restore procedure before production launch
- Privacy-conscious logging; avoid logging sensitive idea content or credentials unnecessarily
- Maintainable, testable separation between UI, domain rules, and integrations
- Keep operating cost near zero during prototype validation; do not assume free tiers are sufficient for production

## 7. Money and regulatory boundaries

- PON does not hold, receive, escrow, transfer, distribute, or execute funds as a product principle.
- Amounts displayed in matching contexts are indicative and are not commitments.
- Do not add a success fee calculated from funding amounts without specialist legal review.
- These boundaries alone do not establish that a feature is outside Japanese financial regulation.
- Any real investment, lending, fundraising, or securities-related functionality requires Japanese legal review before implementation or launch.

## 8. Proposed architecture stages

### Stage 0 — Static prototype
Current state: front-end demonstration only. No real accounts, server persistence, production permissions, AI, payment, identity verification, or actual matching unless specifically implemented and tested.

### Stage 1 — Account-based Web MVP
A responsive Web client, application API, relational database, and managed authentication/storage where needed. Login is required for all product browsing. Design and scope posting/browsing, Free Studio, paid content, and matching together; activate cost-heavy or legally sensitive integrations only after their release gates pass.

### Stage 2 — Optional services
Add Studio AI, paid content, notifications, and matching only after requirements, cost limits, and policy controls are defined.

### Stage 3 — Mobile
Reuse API contracts and domain rules. Select a mobile approach after Web usage validates the need; do not duplicate business logic in clients.

## 9. Proposed code boundaries

For an early MVP, a simple structure is sufficient:

- web client: screens, components, client-side form validation
- domain/application layer: publishing, visibility, purchase entitlements, match state machine
- data layer: database access and migrations
- integrations: authentication, email, AI, payments, identity verification
- tests: domain rules, authorization, API contracts, critical user journeys

Possible future repository layout, not a current requirement:
- apps/web
- apps/mobile
- packages/shared
- services/api

Avoid introducing a complex monorepo, microservices, or native app framework before the actual need is established.

## 10. MVP recommendation

Confirmed design scope for the initial product:
1. Account-only access, including browsing
2. Idea feed, search/category filtering, create/edit draft, publish, and visibility enforcement
3. Free template-based Studio
4. Paid-content preview, purchase, entitlement, refund, and creator-accounting design
5. Structured matching requests, mutual consent, and contact-disclosure rules
6. Report/block/moderation, account deletion, and audit requirements
7. Responsive mobile-browser layout

Real payments, paid AI, identity verification, and real matching must not be activated until their cost, provider, safety, and legal gates are satisfied. Design them now; estimate operating costs before deciding implementation order. Native mobile apps and advanced recommendations remain later enhancements.

## 11. Decisions required before implementation freeze

1. Exact visibility modes and Limited-grant semantics.
2. Authentication provider, email verification, session expiry, and recovery policy.
3. Paid-content model, fee/creator share, refunds, payout, tax handling, and provider.
4. Matching launch gate, categories enabled, verification trigger, and contact disclosure.
5. Moderation, reporting, blocking, deletion, retention, and appeals policy.
6. App repository creation, deployment target, and backend provider choices.
7. Initial traffic assumptions and maximum acceptable monthly operating cost.
8. Studio artifact storage and whether one idea supports multiple paid sections.

## 12. Acceptance principle

No feature is considered production-ready merely because the screen works. It must also have defined permissions, persistence, error behavior, abuse handling, tests, operational visibility, and an honest user-facing description of what it does.
