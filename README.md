# This is my personal website

-   **Framework**: [Next.js](https://nextjs.org/)
-   **React**: [React](https://reactjs.org/)
-   **Mdxjs**: [Mdxjs](https://mdxjs.com/)
-   **TypeScript**: [TypeScript](https://www.typescriptlang.org/)
-   **Storybook**: [Storybook](https://storybook.js.org/)
-   **Testing**: [Jest](https://jestjs.io/)
-   **Deployment**: [Vercel](https://vercel.com)
-   **Package Manager**: Yarn (Berry)

## Overview

-   `.github/workflows/*` - CI/CD workflows.
-   `data/*` - The folder when contain all of my blog posts and other data in mdx format.
-   `public/*` - The folder where all of my static assets live.
-   `public/coverage/*` - The folder where all of my coverage reports live.
-   `public/docs/*` - The folder where all of my documentation live.
-   `public/posts/*` - The folder where all pictures for my blog posts live.
-   `src/components/*` - The folder where all of my components live.
-   `src/pages/*` - The folder where all of my pages live.
-   `src/pages/api` - The folder for API.
-   `src/pages/_app.tsx` - Global configuration for the application.
-   `src/pages/_document.tsx` - Global configuration for the document.
-   `src/constants/*` - The folder where all of my constants live.
-   `src/context/*` - The folder where all of my context providers live.
-   `src/helpers/*` - The folder where all of my helper functions live.
-   `src/hooks/*` - The folder where all of my custom hooks live.
-   `src/intl/*` - The folder where all of my translations live.
-   `styles/*` - The folder where all of my global styles live.

## Running Locally

This application requires **Node.js v18.20.0** (see `.nvmrc`).
Until the Next.js 15 migration is complete, other versions are not supported.
Yarn (Berry) is the official package manager for this project.

```bash
git clone https://github.com/xabierlameiro/the-last-dance.git

# Create your environment file
cp .env.example .env.development # or .env.local

# Use the correct Node.js version (if you have nvm installed)
nvm use

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Node.js Version

This project is pinned to Node.js v18.20.0 until the Next.js 15 migration is complete.
If you have `nvm` installed, you can use:

```bash
nvm use
```

This will automatically use the Node.js version specified in `.nvmrc`.

## Pending tasks

-   Complete coverage
-   Complete storybook
-   Move storybook to a separate repo
-   Move lighthouse to a separate repo
