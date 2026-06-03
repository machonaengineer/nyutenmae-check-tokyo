# Contributing

Contributions are welcome when they preserve the project's privacy, moderation, and cautious-public-copy requirements.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Checks

Run the relevant checks before proposing a change:

```bash
npm run lint
npm run typecheck
npm run build
npm run check:sources:dry
npm run check:official-seed
npm run test:e2e
```

## Contribution Guidelines

- Do not commit real credentials, API keys, cookies, tokens, or private evidence.
- Do not add public pages that expose reporter emails, private notes, unpublished reports, or evidence file paths.
- Use cautious report-based wording for public content.
- Avoid copying external review text or screenshots into the repository.
- Keep configuration values in constants or environment variables rather than hard-coding secrets.

## Pull Request Notes

Please describe the user-facing change, affected routes or scripts, and the checks you ran. For privacy or moderation changes, include the data that remains private after the change.
