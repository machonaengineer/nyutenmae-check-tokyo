# Security Policy

## Scope

This project handles privacy-sensitive reporting workflows. Security reports should focus on issues that could expose private evidence, reporter contact information, admin-only data, service role credentials, moderation queues, or unpublished reports.

## Reporting a Vulnerability

Please do not open a public issue for vulnerabilities that expose private data or credentials.

Send a private report to the maintainer with:

- affected route, API action, script, or migration
- reproduction steps
- expected impact
- whether any private data or credentials may be exposed

The maintainer will triage reports, prioritize privacy and data-access risks, and publish fixes without disclosing private reporter or evidence details.

## Maintainer Practices

- Keep service role keys server-only.
- Keep uploaded evidence and reporter email addresses non-public.
- Review public copy for personal information, unsupported assertions, and attack-oriented wording.
- Run lint, typecheck, build, source checks, and production verification before release-sensitive changes.
