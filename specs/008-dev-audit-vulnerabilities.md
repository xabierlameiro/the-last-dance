# SDD-008: npm audit vulnerabilities (all dev-only)

- **Status**: Resolved 2026-07-17 by silencing the install-time audit noise + documenting.
  No production code/dependency is affected.
- **Trigger**: the Vercel install log shows `23 vulnerabilities (6 low, 17 moderate)`.

## The one fact that matters

`npm audit --omit=dev` reports **0 vulnerabilities**. Every flagged package is a
**dev-only transitive dependency** of build/test tooling. None ship in the deployed
bundle; the site and its users are not exposed. The `23` in Vercel's log is the default
install-time audit, which scans devDependencies too — it is informational, not a build
failure.

## The two clusters (and why neither is safely fixable)

### 1. OpenTelemetry / Sentry — 17 moderate

Path: `lighthouse` (devDep, used by `npm run lighthouse-report`) → `@sentry/node@9` →
`@opentelemetry/core@1.30.1`. Advisory GHSA-8988-4f7v-96qf ("unbounded memory allocation
in W3C Baggage propagation") is fixed in `@opentelemetry/core >= 2.8.0` — a **major** bump.

- `@sentry/node@9` requires `@opentelemetry/core@^1.x`. Even the **latest** `lighthouse`
  (13.4.0) still uses `@sentry/node@9`, so upgrading lighthouse does not help.
- **Tested**: forcing `@opentelemetry/core@^2.8.0` via an npm override installs, and
  `jest` + `lighthouse --version` still load — but `import('@sentry/node')` then throws
  `Cannot read properties of undefined (reading 'AlwaysOn')`. otel 2.x moved the sampler
  API that Sentry 9 depends on. So the override **breaks @sentry/node**. Reverted.
- Not exploitable here: it concerns parsing untrusted W3C Baggage headers, which a local
  CLI performance tool never does.

### 2. elliptic — 6 low

Path: `@storybook/nextjs` (devDep) → `node-polyfill-webpack-plugin` → `crypto-browserify`
→ `browserify-sign` / `create-ecdh` → `elliptic`. Advisory GHSA-848j-6mx2-7j84 affects
`elliptic <= 6.6.1`, and **6.6.1 is the latest** — there is no patched version. It is a
browser crypto polyfill pulled in by Storybook's Next.js preset. (Already dismissed once
in Dependabot.)

`npm audit fix` (non-breaking) fixes none of these. `npm audit fix --force` would make
breaking major changes to storybook/lighthouse.

## Decision

- **Silence the install-time audit** via `.npmrc` (`audit=false`). This removes the noisy
  Vercel line. It does **not** weaken anything: the production gate
  `npm audit --omit=dev --audit-level=high` in `pre-deploy.yml` still runs (verified the
  explicit `npm audit` ignores the flag), and Dependabot still tracks alerts.
- **Dismiss** the corresponding Dependabot alerts as tolerable dev-only risk with no safe fix.
- Do **not** force overrides (they break the tools) and do **not** run `audit fix --force`.

## Real remediation paths (owner decision, out of scope here)

- **Drop the otel cluster (17)**: stop depending on `lighthouse` as an npm package — rewrite
  `lighthouse/assets/lighthouse.js` to shell out to the `lighthouse` CLI in the
  `post-deploy` workflow instead of importing it. Then lighthouse (and its sentry/otel) leave
  the tree.
- **Drop the elliptic cluster (6)**: remove Storybook (its build is already broken under
  React 19 — [[storybook-build-broken]]) or wait for `@storybook/nextjs` to drop the
  crypto polyfill.
- **Upstream waits**: Sentry adopting otel 2.x, or elliptic shipping a patch.

## Acceptance criteria

- `npm audit --omit=dev` = 0 (already true).
- Vercel install log no longer prints the vulnerability count.
- CI production-audit gate still runs and passes.
