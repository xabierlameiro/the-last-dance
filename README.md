# the-last-dance — Personal Website

My personal website and blog, built with Next.js, MDX, TypeScript, Storybook, and Jest. Deployed on Vercel.

[![CI](https://github.com/xabierlameiro/the-last-dance/actions/workflows/ci.yml/badge.svg)](https://github.com/xabierlameiro/the-last-dance/actions/workflows/ci.yml)

## Stack

| Layer           | Choice                                    |
| --------------- | ----------------------------------------- |
| Framework       | Next.js (Pages Router)                    |
| Language        | TypeScript                                |
| Content         | MDX                                       |
| Testing         | Jest + Testing Library + Storybook        |
| Package manager | Yarn (Berry)                              |
| CI/CD           | GitHub Actions + Vercel                   |
| Node.js         | v18.20.0 (pinned in `.nvmrc`)             |

## Project structure

```
data/             # Blog posts and content in MDX format
public/           # Static assets, coverage reports, docs
src/
  components/     # Reusable components (with Storybook stories + Jest tests)
  constants/      # App-wide constants
  context/        # React context providers
  helpers/        # Utility functions
  hooks/          # Custom React hooks
  intl/           # i18n translations (en + es)
  pages/          # Next.js pages and API routes
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
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script         | Description                  |
| -------------- | ---------------------------- |
| `yarn dev`     | Start development server     |
| `yarn build`   | Production build             |
| `yarn start`   | Start production server      |
| `yarn lint`    | ESLint                       |
| `yarn test`    | Jest unit tests              |
| `yarn storybook` | Start Storybook dev server |

## Deployment

Deployed automatically to [Vercel](https://vercel.com) on every push to `master`.

## License

[MIT](./LICENSE)
