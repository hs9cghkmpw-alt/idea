# PON development handoff for Claude

更新日: 2026-10-15  
Repository: `hs9cghkmpw-alt/idea`  
Working branch at handoff: `docs/concept-foundation`  
Project status: early-stage concept + static LP + local-only functional prototype. Not production-ready.

## 1. What PON is
PON helps people take an idea from a rough thought to an organized draft, then potentially to visualization, validation, and optional collaboration. The initial experience should feel safe and lightweight: a single sentence is enough to begin, and the user may stop without publishing or committing to anything.

**Non-negotiable audience decision:** PON is for a broad range of people from day one: individuals, students, employees, creators, freelancers, businesses, communities, developers, and others. It also accepts different idea types, including everyday inconveniences, workplace improvements, inventions, and business/service concepts. Do not narrow the audience. Narrow the initial feature set instead.

Brand direction is provisional: PON; approachable with a little edge; charcoal/lime/cream with an orange accent. Copy includes 「思いついたら、ポン。」 and 「その妄想、一回、出してみ。」

## 2. Current repository artifacts
- `index.html`: static concept LP. Not a live service.
- `prototype/index.html`: browser-only, template-based interaction. It is not AI and does not send or persist idea text.
- `docs/PON-STRATEGY-SUMMARY.md`: consolidated product decisions.
- `docs/MVP-SPEC-AND-ACCEPTANCE-CRITERIA.md`: MVP scope and acceptance criteria.
- `docs/FIRST-USE-UX-SPEC.md`: first-use flow.
- `docs/DATA-MODEL-AND-PRIVACY-THREAT-MODEL.md`: conceptual data model and threats.
- `docs/TECHNICAL-ARCHITECTURE-AND-IMPLEMENTATION-PLAN.md`: phased architecture/backlog.
- `docs/INITIAL-USER-INTERVIEW-GUIDE.md` and `docs/INITIAL-USER-EXPERIENCE-AND-GROWTH.md`: validation and broad-audience guidance.
- `docs/IDENTITY-VERIFICATION.md`, `docs/IDENTITY-VERIFICATION-COMPARISON.md`, and `docs/SAFETY-PRICING-MVP.md` may exist on the branch; inspect actual tree before relying on any path.
- Root `CLAUDE.md` contains repository-level rules and must be read first.

## 3. Actual current capabilities (do not overstate)
The prototype is intended to support:
- one-sentence text input (maximum 1200 characters);
- example idea buttons;
- template-based organization into summary/problem/audience/solution/known information/unknowns;
- editable result fields;
- copy-to-clipboard on explicit user action;
- restart/reset and empty-input feedback.
It uses no AI API, server, account, database, upload, analytics, or persistence. Input is held in page memory and is lost when the page closes/reloads. Clipboard use occurs only when the user presses the copy action.

Static source checks were previously recorded for no external requests, no fetch, no localStorage, basic accessibility hooks, edit fields, LP link, duplicate IDs, and internal anchors. These checks are **not** browser runtime verification. PC and mobile browser testing, keyboard/screen-reader review, clipboard verification, and visual inspection remain unverified unless Claude runs them in a real browser environment and records the evidence.

The LP and prototype have not been confirmed deployed. Do not treat GitHub source links as a running preview. Do not attempt to make the repository public or deploy it without approval.

## 4. Decisions and safety gates
- Free/zero-cost first; do not introduce billable services, paid APIs, auto-billing, or credit-card requirements without explicit approval.
- Do not build payment, money transfer, investment/lending intermediation, or transaction fees in the initial scope.
- Public/limited/private visibility, user consent, deletion, moderation, and server-side authorization must be designed before public posting or collaboration is implemented.
- Default private if saving is introduced. A saved draft must not become public by default.
- Before collaboration/negotiation, identity verification should be performed by an external provider; PON should not retain My Number or identity-document images. Keep only the minimum verification result/method/time if needed. Verification does not guarantee trustworthiness or competence.
- Before a match, keep personal contact information hidden. Company name/official site may be optionally displayed, but staff private contact details remain hidden by default.
- Never promise protection against copying or perfect anonymity.
- Any future AI integration requires server-side secrets, request and user limits, input length limits, timeouts, bounded retries, hard spend cap, kill switch, and template fallback.
- Do not add analytics or transmit draft contents without explicit approval and clear user-facing disclosure.

## 5. Recommended first assignment
Start with **P0 quality assurance and improvements only**. Do not connect an AI API or add persistence/auth/deployment in this first task.

1. Inspect the latest branch and read `CLAUDE.md` plus the linked requirements.
2. Review `prototype/index.html` and `index.html` for concrete functional defects, misleading copy, unsafe DOM use, keyboard/accessibility issues, and mobile layout risks.
3. Add dependency-free automated/static checks if feasible without introducing a package manager or third-party dependency. If a test runner is unavailable, add a clear manual test checklist instead.
4. Fix only verified issues. Do not rewrite the product or redesign the whole LP without evidence.
5. Confirm that the prototype does not send data, persist it, or load third-party assets.
6. Check the LP links and ensure the user can tell the difference between a concept, a template-based local demo, and a live feature.
7. Update documentation with exact checks run, outcomes, and items not tested.
8. Open/update a PR for review. Do not merge it.

## 6. Acceptance criteria for the first assignment
- [ ] Empty input produces a clear error and does not show a false successful result.
- [ ] Example buttons fill the input and do not accidentally submit/publish anything.
- [ ] A non-empty idea can be organized using a deterministic template; the UI never calls it AI.
- [ ] Output fields can be edited.
- [ ] Copy action copies the current edited result only after explicit user action; failure is handled visibly.
- [ ] Reset clears both input and result state.
- [ ] Reload/close loses the draft; no browser persistence is introduced.
- [ ] No network request is triggered by entering or organizing an idea; no external assets are loaded.
- [ ] User text is rendered safely; no unsafe injection via `innerHTML` or equivalent.
- [ ] Keyboard navigation, visible focus, labels, status/error announcements, and narrow viewport behavior are reviewed.
- [ ] LP and prototype accurately disclose what is and is not implemented.
- [ ] Changes are small, documented, and reviewed; no merge/deploy occurs.
- [ ] Report distinguishes static checks from actual browser runtime checks.

## 7. Required PR report
Include:
1. Summary and reason for each change.
2. Files changed.
3. Checks actually run, exact commands, and results.
4. Manual tests not run and why.
5. Privacy/security/accessibility review notes.
6. Known issues and recommended next step.
7. Confirmation that no paid service, external request, persistence, deployment, or merge was introduced.

## 8. Do not do
- Do not narrow the intended audience.
- Do not imply AI is connected when it is not.
- Do not add a login, database, server, paid API, analytics, tracking, external assets, billing, or deployment in the first assignment.
- Do not make the repo public.
- Do not merge to the default branch.
- Do not claim a browser test passed if it was not run.
- Do not replace explicit user decisions with assumptions. Ask in the PR if a product decision is genuinely blocking.
