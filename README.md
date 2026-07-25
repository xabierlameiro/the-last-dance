# the-last-dance — Personal Website

My personal website and blog, built with Next.js, MDX, TypeScript, Storybook and Jest. Deployed on Vercel.

[![Post-Deploy](https://github.com/xabierlameiro/the-last-dance/actions/workflows/post-deploy.yml/badge.svg)](https://github.com/xabierlameiro/the-last-dance/actions/workflows/post-deploy.yml)

## Stack

| Layer           | Choice                                               |
| --------------- | ---------------------------------------------------- |
| Framework       | Next.js 15 (Pages Router)                            |
| Language        | TypeScript                                           |
| Content         | MDX                                                  |
| i18n            | `en`, `es`, `gl` (Next.js i18n routing + react-intl) |
| Unit tests      | Jest + Testing Library                               |
| Component docs  | Storybook                                            |
| E2E tests       | Playwright                                           |
| Package manager | npm (`package-lock.json`)                            |
| CI/CD           | GitHub Actions + Vercel                              |
| Node.js         | 22 (pinned in `.nvmrc` and `engines`)                |

## Project structure

```
data/             # Blog posts and content in MDX format
docs/             # Editorial and writing standards
e2e/              # Playwright end-to-end tests
lighthouse/       # Lighthouse report generator
public/           # Static assets, coverage reports, generated docs
scripts/          # Build and post-deploy scripts (llms.txt, posters, IndexNow, trending)
specs/            # Design and remediation specs
src/
  components/     # Reusable components (with Storybook stories + Jest tests)
  constants/      # App-wide constants
  context/        # React context providers
  helpers/        # Utility functions
  hooks/          # Custom React hooks
  intl/           # i18n translations (en + es + gl)
  pages/          # Next.js pages and API routes
  types/          # Shared TypeScript types
  __tests__/      # Tests for API routes and pages
styles/           # Global CSS styles
```

## Running locally

```bash
git clone https://github.com/xabierlameiro/the-last-dance.git
cd the-last-dance

# Use the correct Node.js version
nvm use

# Copy environment variables
cp .env.example .env.development

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`--legacy-peer-deps` is not optional. `@code-hike/mdx@0.8.3` declares
`peer react@"^16.8.3 || ^17 || ^18"`, which conflicts with the React 19 this
project runs, so a plain `npm install` fails with `ERESOLVE`. CI installs the
same way.

## Environment variables

`.env.example` lists every key. The ones that change behaviour locally:

| Variable             | Used for                                                            |
| -------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_DOMAIN` | Canonical URLs and hreflang tags                                    |
| `NEXT_PUBLIC_ENV`    | Gates the Google Analytics scripts — they load only on `production` |
| `NEXT_PUBLIC_GA`     | GA4 measurement ID for the client-side gtag scripts                 |
| `ANALYTICS_*`        | Service-account credentials for the GA4 Data API (view counters)    |
| `GITHUB_TOKEN`       | Repository star counter                                             |

## Scripts

| Script                      | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `npm run dev`               | Start development server                         |
| `npm run build`             | Production build (runs `prebuild` → `llms.txt`)  |
| `npm start`                 | Start production server                          |
| `npm run lint`              | ESLint                                           |
| `npm run typecheck`         | `tsc --noEmit`                                   |
| `npm test`                  | Jest unit tests                                  |
| `npm run coverage`          | Jest with coverage, written to `public/coverage` |
| `npm run test:e2e`          | Playwright end-to-end tests                      |
| `npm run storybook`         | Start Storybook dev server on port 6006          |
| `npm run jsdoc`             | Generate API docs into `public/docs`             |
| `npm run lighthouse-report` | Lighthouse report for every sitemap URL          |
| `npm run trending`          | Trending-content radar                           |
| `npm run prettier`          | Format the repository                            |

## CI/CD

| Workflow             | Trigger              | What it does                                                                             |
| -------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `post-deploy.yml`    | push to `master`     | IndexNow ping (Bing), then Lighthouse reports published to `performance-report`          |
| `trending-radar.yml` | Mondays 07:00 UTC    | Opens an issue with data-driven post briefs; never publishes content itself              |
| `pre-deploy.yml`     | push to `dev`        | Lint, typecheck, `npm audit`, unit + e2e tests, JSDoc, version bump, Vercel preview deploy |

Production deploys to [Vercel](https://vercel.com) on every push to `master`.

`pre-deploy.yml` only runs on the `dev` branch. Work has been landing on
`master` through pull requests instead, so it has not run since July 2025 — the
lint, typecheck, unit, e2e and audit gates it owns are currently dormant.

## License

[MIT](./LICENSE.txt)
