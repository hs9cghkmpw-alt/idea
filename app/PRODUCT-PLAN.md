# PON Web App — Product Plan

Updated: 2026-10-16

## 1. Product principle

PON helps ideas be shared, understood, developed, and circulated. It is not primarily an investment-proposal generator or an investment platform. The audience is broad from the beginning: everyday ideas through business concepts.

## 2. Product surfaces

- Promotion site: explains the value proposition and invites people to understand PON. Keep separate from the product UI.
- Web app: the first product surface.
- Future mobile apps: consider iOS/Android after validating the Web experience. Avoid decisions that unnecessarily block mobile reuse, but do not over-engineer now.
- Current repository separation is by directory only. A dedicated app repository remains a future step.

## 3. Core experiences

- Product-app access is account-based: login is required even to browse. The promotional site remains public and separate.

1. Discover ideas through a feed, search, and categories.
2. Publish an idea without needing to use Studio.
3. Optionally structure and visualize an idea in Studio.
4. Optionally configure a paid section on an idea; one-time purchase is the first design candidate, while subscriptions remain undecided.
5. Express interest in collaboration/matching through a structured request and mutual-consent flow; real launch activation is subject to cost, safety, and legal gates.
6. Establish a match only after both parties review and consent.

## 4. Studio

- Free tier: template-based structuring and visualization; no real AI integration in the prototype.
- Potential paid tier: AI-assisted refinement, structuring, diagrams, and documents.
- Studio is optional; it must not become a gate to posting or sharing.
- Pricing and model/API costs are undecided and must be estimated before setting prices.

## 5. Monetization candidates — not final decisions

- Paid Studio subscription.
- Paid content purchase and/or monthly membership.
- Matching-related membership or premium tools.
- Visibility boosts, analytics, and B2B offerings.

Do not publish prices or promise payouts until operating costs, provider fees, legal constraints, and the creator revenue model have been evaluated.

## 6. Matching and money boundaries

- Possible categories: co-development, business partnerships, technical/talent support, distribution, and information about capital, loans, or subsidies.
- Flow: browse → express interest → other party reviews → both consent → match is established → only then unlock agreed contact/details.
- One-sided interest is not a match; users should be able to withdraw before a match is established.
- Amounts shown are indicative, not commitments.
- PON does not hold, receive, escrow, transfer, distribute, or execute funds.
- Avoid success fees calculated from funding amounts.
- This boundary alone does not guarantee exemption from Japanese financial regulation. Real investment/funding functionality requires specialist legal review.

## 7. Trust and privacy

- Anonymous or unverified idea posting may be supported.
- Matching or discussion may require third-party identity verification.
- If implemented, PON should retain only minimum verification metadata (status, method, timestamp), not copies of identity documents or My Number images.
- Public/limited/private visibility is a product requirement, but do not claim it is secure until access controls are implemented and tested.
- Never expose private contact details before the agreed consent stage.

## 8. Prototype limitations

The current prototype is a static front-end demonstration. Unless subsequently implemented and tested, it does not provide real accounts, server-side persistence, real AI, payments, identity verification, production access control, or real matching. Demo actions must not imply that real transactions or agreements have occurred.

## 9. Recommended development sequence

### Phase A — Validate the experience
- Keep the promotion site unchanged.
- Refine the app's information architecture and responsive UI.
- Test the core flow: discover → open idea → create idea → preview → Studio → express/cancel interest.
- Add clear demo-state labels and accessible interaction feedback.

### Phase B — Define a minimum viable product
- Decide the first launch's required features and explicitly defer the rest.
- Define user roles, content visibility rules, moderation/reporting, deletion, and consent states.
- Write acceptance criteria for every core flow.

### Phase C — Estimate operations and monetization
- Estimate hosting, database, storage, email, identity verification, AI usage, payment processing, monitoring, and support costs.
- Use those estimates to set pricing and limits; do not invent prices in advance.

### Phase D — Implement real services
- Choose authentication, database, API, storage, payment provider, moderation, and observability.
- Add privacy/security controls and tests before opening private content or matching to real users.

### Phase E — Mobile
- Reuse API contracts and shared domain rules.
- Choose a mobile strategy after Web MVP validation (for example, a cross-platform app), based on actual usage and maintenance capacity.

## 10. Architecture direction

For the MVP, keep a simple Web app with clear boundaries between UI, domain rules, and service/API access. If the product grows, a possible layout is:

- apps/web
- apps/mobile
- packages/shared
- services/api

This is a future direction, not a requirement to introduce a monorepo or mobile framework immediately.

## 11. Decisions still open

- Dedicated app repository name and creation.
- Detailed release gates and the exact point at which each in-scope domain is activated.
- Exact visibility labels/grant semantics, moderation policy, deletion/retention, and appeal rules.
- Paid content fees, creator share, refunds/taxes/payouts, whether subscriptions launch, and Studio pricing.
- AI model/provider, usage limits, and cost controls.
- Authentication provider/session design and external identity-verification provider.
- Payment provider and legal review for any regulated-adjacent features.
- Backend/hosting architecture, initial traffic assumptions, and acceptable monthly cost ceiling.


## Security-first activation criteria

Feature design can cover all four domains while launch activation remains gated. Before real users are admitted, satisfy the [Security Baseline](docs/SECURITY-BASELINE.md) and review the [Authorization and Privacy Matrix](docs/AUTHORIZATION-AND-PRIVACY-MATRIX.md), [Matching State Machine](docs/MATCHING-STATE-MACHINE.md), and [Paid Content Transaction Model](docs/PAID-CONTENT-TRANSACTION-MODEL.md).

No launch approval based on prototype appearance alone. Require server-enforced authorization, negative tests, verified/idempotent payment events, immutable consent/versioning, operational moderation and incident ownership, monitoring, backup restore verification, and explicit feature-by-feature release approval. Paid checkout and legally sensitive matching categories remain disabled until their separate business/legal gates are approved.
