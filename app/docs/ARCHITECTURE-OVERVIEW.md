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

- Visitor: browse public ideas and understand the service.
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
- Public feed
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

### Stage 1 — Web MVP
A responsive Web client, a small application API, a relational database, and managed authentication/storage only where needed. Start with the smallest core experience that can validate discovery and publishing.

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

Recommended initial scope to validate PON's core value:
1. Public idea feed and idea detail
2. Search/category filtering
3. Create/edit draft and publish an idea
4. Explicit visibility choice, with server-enforced rules when backend exists
5. Basic report/moderation workflow
6. Free template-based Studio as an optional aid
7. Responsive mobile-browser layout

Defer until separately designed:
- Real payments and paid content
- Real AI integration
- Real matching/contact unlock
- Identity verification
- Native mobile apps
- Advanced recommendations and analytics

This is a recommendation for review, not a final scope approval.

## 11. Decisions required before detailed design

1. First release: public read-only access or require login to browse?
2. Visibility modes and who can see each mode.
3. MVP scope: whether Studio and matching are included in the first backend release or remain prototype-only.
4. Whether paid content is an early requirement or later phase.
5. Moderation, reporting, blocking, deletion, and appeal rules.
6. Account deletion and data retention policy.
7. App repository creation and deployment target.
8. Expected initial traffic and maximum acceptable monthly operating cost.

## 12. Acceptance principle

No feature is considered production-ready merely because the screen works. It must also have defined permissions, persistence, error behavior, abuse handling, tests, operational visibility, and an honest user-facing description of what it does.
