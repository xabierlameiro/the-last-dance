# Contributing

Thank you for your interest in contributing to this project!

## Getting started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the quality gates (see below)
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Open a Pull Request

## Development setup

This project requires **Node.js v18.20.0** (pinned in `.nvmrc`).

```bash
git clone https://github.com/xabierlameiro/the-last-dance.git
nvm use
yarn install
yarn dev
```

## Quality gates

All must pass before submitting a PR:

```bash
yarn lint    # ESLint
yarn test    # Jest unit tests
yarn build   # Next.js production build
```

## Project structure

- `src/components/` — Reusable React components (each with co-located Storybook story and Jest test)
- `src/pages/` — Next.js pages and API routes
- `data/` — Blog posts and content in MDX format
- `src/intl/` — Translations (English + Spanish)
- `src/hooks/` — Custom React hooks

## Coding conventions

- TypeScript strict mode — no `any`
- Every component should have its Storybook story and Jest test
- Translations must be added for both `en` and `es` locales
- Use Yarn (Berry) — do not mix with npm or pnpm

## Reporting bugs

Open a [GitHub issue](https://github.com/xabierlameiro/the-last-dance/issues) with:
- A clear title and description
- Steps to reproduce
- Expected vs actual behavior

## Questions

Feel free to open a [GitHub Discussion](https://github.com/xabierlameiro/the-last-dance/discussions) or reach out to [@xabierlameiro](https://github.com/xabierlameiro).
