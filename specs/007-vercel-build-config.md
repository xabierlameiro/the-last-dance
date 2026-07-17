# SDD-007: Vercel build config as single source of truth + pinned Node

- **Status**: Implemented 2026-07-17. Repo changes here; one owner dashboard action remains.
- **Trigger**: the Vercel project's Framework Settings show "Overridden" — the dashboard
  Project Settings diverge from what production actually built with.

## What was wrong

The Vercel dashboard had **manual overrides that fight `vercel.json`**:

- Dashboard **Install Command** override = `yarn prod`.
- Dashboard **Build Command** override = `npm run build`.
- `vercel.json` (the repo) = `installCommand: npm install --legacy-peer-deps --include=optional`,
  `buildCommand: npm run build`.

Per Vercel docs, `vercel.json`'s `installCommand`/`buildCommand` **override** the dashboard
Project Settings. The "Production Overrides" panel confirms production actually installed with
`npm install --legacy-peer-deps --include=optional` (the `vercel.json` value) — so the dashboard
`yarn prod` was dead, stale config only producing the confusing "Overridden" banner.

### Why `yarn prod` is a latent risk (not just noise)

- The project is **npm** — the only lockfile is `package-lock.json`, there is no `packageManager`
  field. Vercel detects npm from that lockfile.
- `yarn prod` runs the `prod` script, which is `npm install --legacy-peer-deps --silent` — note it
  **lacks `--include=optional`**. If `vercel.json` were ever removed and the dashboard override
  won, optional platform binaries (e.g. `sharp`) could be skipped → broken image optimization at
  runtime. It also mixes yarn as a launcher for an npm install, which is fragile.

### Node version was ambiguous

`engines.node` was `">=20.0.0"`. Vercel reads `engines.node` and it **overrides** the dashboard
Node version, but a range lets Vercel pick any satisfying version, so the build Node drifts as
Vercel updates its defaults. CI (`pre-deploy.yml`, `post-deploy.yml`) already runs on **Node 22**.

## Decisions

- **Package manager: stay on npm.** Do not switch to yarn or pnpm. The lockfile is
  `package-lock.json` and the React 19 install depends on `--legacy-peer-deps` (npm flag).
  Switching PM means a new lockfile and re-resolution — real breakage risk, zero benefit here.
- **`vercel.json` is the single source of truth.** Added `"framework": "nextjs"` and `$schema`;
  `buildCommand`/`installCommand` already live there. No command belongs in the dashboard.
- **Pin `engines.node` to `22.x`** — deterministic, matches CI, and (per Vercel docs) overrides
  the dashboard Node setting. Local dev on Node 24 only gets a harmless engine warning (no
  `.npmrc` `engine-strict`).
- Aligned `trending-radar.yml` from Node 20 → 22 so every workflow uses the same major.

## Owner follow-up (dashboard — cannot be done from the repo)

In Vercel → Project → Settings → Build & Deployment, **turn OFF the Install Command and Build
Command overrides** (the two blue toggles). With them off, Vercel falls back to `vercel.json`,
the "Overridden" banner clears, and the `yarn prod` command is gone for good. The Node.js Version
dashboard setting can be left as-is; `engines.node: 22.x` overrides it regardless.

## Acceptance criteria

- Production and preview deployments install with `npm install --legacy-peer-deps --include=optional`
  and build with `npm run build`, sourced from `vercel.json`.
- Build runs on Node 22.x.
- Dashboard shows no "Overridden" divergence once the owner clears the two toggles.
