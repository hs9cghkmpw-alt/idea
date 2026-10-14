# Security Policy

## Scope

This repository currently contains the PON concept/landing-page materials. It is not, by itself, evidence that a production application or backend is deployed. Review the actual hosting and deployment configuration separately before launch.

## Reporting a vulnerability

Please do not publish credentials, personal data, or exploitable details in a public issue. Use GitHub's private vulnerability reporting feature if it is enabled for this repository. Otherwise, contact the repository owner privately through an established channel.

Include:
- affected URL, file, or component;
- impact and prerequisites;
- minimal reproduction steps that do not access other people's data;
- timestamps and relevant request IDs, with secrets and personal data redacted.

## If a secret is exposed

1. Revoke or rotate the exposed credential immediately at the issuing provider.
2. Check audit logs for use since the earliest possible exposure.
3. Remove the secret from current files and configuration.
4. Review Git history and CI logs. A new commit alone does not remove a secret from history.
5. Check for unauthorized deployments, repository changes, new tokens, and unexpected workflows.
6. Record the incident timeline and verify the replacement credential is stored only in the appropriate secret manager.

Do not paste live tokens, passwords, private keys, session cookies, or unredacted logs into issues, AI prompts, or chat.

## Release baseline

Before publishing a live service:
- enable available GitHub secret scanning and push protection;
- review repository collaborators, tokens, deploy keys, and GitHub Actions permissions;
- keep deployment credentials in the hosting provider's secret store;
- restrict production deploys to reviewed changes;
- verify HTTPS, security headers, access controls, and logs on the actual deployed service;
- test backup and restore procedures for any persistent data.
