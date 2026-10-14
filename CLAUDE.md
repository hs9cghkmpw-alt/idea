# CLAUDE.md — PON repository instructions

## Mission
Build PON incrementally: a low-friction platform where people can externalize rough ideas, organize them, visualize them, validate assumptions, and optionally collaborate. Work from the existing product decisions and acceptance criteria in this repository; do not silently redefine the product.

## Read first
Before changing code, read these files in order:
1. `README.md`
2. `docs/PON-STRATEGY-SUMMARY.md`
3. `docs/MVP-SPEC-AND-ACCEPTANCE-CRITERIA.md`
4. `docs/FIRST-USE-UX-SPEC.md`
5. `docs/DATA-MODEL-AND-PRIVACY-THREAT-MODEL.md`
6. `docs/TECHNICAL-ARCHITECTURE-AND-IMPLEMENTATION-PLAN.md`
7. `docs/DEVELOPMENT-HANDOFF.md`
8. Inspect `index.html` and `prototype/index.html` before editing either.

If documents conflict, follow this precedence:
1. Explicit user-approved decisions documented in the strategy summary
2. MVP acceptance criteria and privacy/threat model
3. Technical plan
4. Existing UI/code
5. Your own assumptions

Document any unresolved conflict instead of guessing.

## Product decisions that must not drift
- **Audience is broad from day one.** Do not narrow PON to startups, entrepreneurs, developers, companies, or any single demographic. The initial scope is narrow in functionality, not in who may use it or what kind of idea they may bring.
- A rough one-sentence idea is a valid starting point. A business plan, expertise, registration, publication, monetization, or commitment must not be required for the first local experience.
- Users can stop after organizing an idea. Do not force publication, startup formation, collaboration, or fundraising.
- Brand is provisionally PON. Tone is approachable with a little edge. Brand lines include 「思いついたら、ポン。」 and 「その妄想、一回、出してみ。」
- Visual direction: charcoal + lime + cream, with orange accent. Keep the UI responsive and lightweight.
- The current local prototype is a **template-based demo, not AI**. Never describe its output as AI-generated.
- Be explicit about implemented vs. planned functionality. Never fake a successful submission, save, upload, AI response, verification, payment, or match.
- Zero-cost / minimal-cost operation is a priority. Do not add paid services, paid APIs, billing, subscriptions, or credit-card requirements without explicit approval. A free tier does not automatically mean zero cost.
- No public deployment, production release, merge to the default branch, or repository visibility change without explicit user authorization.

## Privacy, security, and trust requirements
- New drafts are private by default if persistence is introduced.
- Do not expose personal names, email addresses, phone numbers, social handles, home addresses, or employers before necessary and explicitly consented disclosure.
- Company name/official site may be a display option, but must not expose a staff member's private contact information by default.
- A request being accepted is not the same as consent to reveal personal data. Keep collaboration approval, conversation start, and personal-data disclosure as separate actions.
- Never promise that an idea cannot be copied or that a user is absolutely anonymous.
- Identity verification is intended to be required at the matching/negotiation stage, not for basic idea posting. Use a third-party verification provider if/when implemented. PON should not collect or store My Number or identity-document images; store only minimum verification status/method/time where needed. Verification does not guarantee honesty, ability, or transaction safety.
- Treat user-submitted ideas and attachments as untrusted input. Plan for XSS, prompt injection, IDOR/BOLA, authorization bypass, abuse, data leakage, and cost exhaustion before introducing server-side storage, uploads, public sharing, or AI.
- Never put API keys or secrets in browser code, commits, logs, or examples. Do not log idea text, personal data, credentials, or tokens unnecessarily.
- No external network requests from the current local-only prototype. Do not add analytics, trackers, remote fonts, external libraries, or external APIs without a documented need and explicit approval.
- Do not introduce persistent browser storage to the local prototype unless the user approves a product/privacy change; current behavior is intentionally memory-only.
- Any future AI endpoint must have server-side secrets, input limits, rate limits, timeouts, bounded retries, a hard spend cap, a kill switch, and a template fallback.

## Engineering rules
- Inspect the current branch and files before editing. Preserve unrelated user work.
- Keep changes small, reviewable, and aligned to one issue/PR.
- Prefer plain HTML/CSS/JavaScript and no dependencies for the current static stage.
- Do not add frameworks, build systems, packages, database, auth provider, hosting, or third-party SDK without documenting why and getting approval when it changes cost, deployment, or data processing.
- Use semantic HTML, explicit form labels, visible focus, keyboard support, accessible status/error announcements, adequate contrast, and responsive layout.
- Validate input and handle empty, malformed, and unexpected states. Avoid unsafe HTML injection; use safe DOM APIs and textContent for user-provided text.
- Keep Japanese copy natural and explain technical or legal uncertainty rather than presenting assumptions as facts.
- Update documentation whenever actual implementation status or behavior changes.
- Do not mark a task complete based only on writing code. Distinguish source review, automated/static checks, browser runtime checks, user validation, and deployment verification.
- Never claim a test ran unless it actually ran; report exact commands and outcomes. If browser execution is unavailable, say so and provide a reproducible manual test checklist.

## Default working process
1. Read the required docs and inspect relevant code.
2. State the concrete issue and smallest safe scope in the PR description or issue comment.
3. Implement only that scope.
4. Run available checks; add dependency-free tests where practical.
5. Review the diff for privacy, security, accessibility, responsiveness, misleading claims, and accidental external requests.
6. Update docs and the handoff status.
7. Summarize changed files, tests actually run, tests not run, risks, and next steps.

## Scope order
1. P0: verify and improve the current local prototype and LP; fix defects; add reproducible checks/manual test steps.
2. P1: usability validation and wording improvements based on evidence.
3. P2: evaluate AI providers and cost/privacy controls, but do not connect a paid API without approval.
4. P3: only after approval, design persistence/auth with server-side authorization and deletion.
5. P4: only after approval and release gates, implement sharing, public posting, matching, and identity verification.
Do not skip ahead to public posting, payments, investment, or unrestricted messaging.

## Definition of done
A change is complete only when:
- acceptance criteria are mapped to implementation;
- tests/checks and their actual results are recorded;
- no feature is represented as implemented when it is not;
- privacy/security implications are considered;
- docs/status are updated;
- remaining unverified behavior is explicitly listed.
