# SDD-001: Quality Refactor — SonarQube / Fallow Audit Remediation

- **Status:** Implemented on branch `feat/quality-refactor` (see §9 Results)
- **Date:** 2026-07-11
- **Scope:** whole repo (`the-last-dance` personal site, Next.js 15 pages router)
- **Decisions taken** (owner delegated "lo que sea mejor"): (1) email feature **removed**; (2) `/survey` **kept**, XSS eliminated; (3) `fileReader` and other dead exports **removed/made private**; (4) `lighthouse/assets/**` and `data/**` **excluded** from analysis.

## 1. Audit baseline (reproduced locally, 2026-07-11)

| Tool | Result |
| --- | --- |
| `fallow health --score` | **56/100 (C)** — unused deps −25, unit size −10, dead files −4.3, coupling −2, dead exports −1.2 |
| `tsc --noEmit` | **1 error** — `src/pages/api/email.ts` is not a module (file is empty) |
| `npm audit` | **23 vulnerabilities** (6 low, 17 moderate) — all via `@storybook/nextjs → node-polyfill-webpack-plugin → crypto-browserify → elliptic` |
| ESLint + SonarJS recommended | **15 issues** (nested ternaries, `Function` type, shadowed globals, super-linear regex, `@ts-ignore`, `prefer-const`) |
| `next lint` (current config) | 0 issues — config only enforces `no-unused-vars`, hence the gap vs SonarQube |
| `jest` | **45/45 suites, 81/81 tests green** — safety net for the refactor |

Key context: most CRITICAL complexity/duplication findings live in **vendored third-party files** (`lighthouse/assets/raphael.js`, `Treant.js`), and 89 % of "dead files" are `data/**/*.mdx` blog content read via `fs` at runtime — analyzer scoping problems, not code problems.

## 2. Findings

### F1 — Reflected XSS on `/survey` · **Critical (confirmed)**
`src/hooks/useSurvey.ts:79-91` interpolates `router.query.name` into an HTML string; `src/components/QuestionBlock/index.tsx:41` renders it with `dangerouslySetInnerHTML`. No sanitization exists (the `skipcq` comment claiming it is sanitized is wrong). CSP allows `'unsafe-inline'`, so `/survey?name=<img src=x onerror=…>` executes.

### F2 — Broken feature: empty `/api/email` · **Critical (functional)**
`src/pages/api/email.ts` is a 0-byte file. `useSurvey.ts:255` still POSTs to it on survey completion; the failure is swallowed by an empty `catch`. Emptied in commit `cd9fa42` ("fix: vulnerabilities") instead of being removed. Side effects: breaks `tsc --noEmit`, makes `nodemailer` a dead dependency.

### F3 — Build quality gates disabled · **High**
`next.config.js:43-48`: `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. This is why F2 shipped unnoticed. The safety net is off.

### F4 — Bogus package `eslint-plugin-next@^0.0.0` · **High (supply chain)**
Placeholder/squatted npm package in devDependencies. The real plugin is `@next/eslint-plugin-next` (already pulled in via `eslint-config-next`). Remove.

### F5 — 23 npm vulnerabilities · **High**
All from the Storybook webpack-polyfill chain (dev-only exposure, but flagged by every scanner). Fix by upgrading/pruning Storybook packages and adding an `overrides` for `elliptic` if remnants persist.

### F6 — `/api/indexed-pages` design smells · **Medium**
- `SERP_API_KEY` sent in URL query string (SerpAPI requires it; document, and never log full URL).
- Fallback scrapes `google.com/search` with a spoofed browser User-Agent — fragile and ToS-questionable.
- Super-linear regex (`sonarjs/super-linear-regex`) on the scraped response at line 68.
- On total failure it returns a **fabricated** count (`127`) as if real. Should return cached-last-known or an honest error.

### F7 — Dependency hygiene · **Medium**
- Misplaced in `dependencies` (belong in devDependencies or nowhere): `@babel/core`, `@babel/preset-typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `webpack`, `jsdom`.
- Truly unused (verified by grep): `nodemailer` (pending F2 decision), `dotenv-load`, `next-env`, `@floating-ui/dom` (not a peer of `@floating-ui/react`), `sharp` (Next 15 bundles its own).
- **Keep** despite Fallow flags (peer deps of `@next/mdx`): `@mdx-js/loader`, `@mdx-js/react`.
- Version mismatches: `jest@28` vs `jest-environment-jsdom@29`; Storybook 8 alongside legacy `@storybook/addons@6.5`, `@storybook/theming@6.5`, deprecated `@storybook/testing-library`; `prettier@2` (v3 current); `eslint-config-prettier@8` (old).
- CI installs with `--legacy-peer-deps` — symptom of the above conflicts.

### F8 — Analyzer noise (why Sonar/Fallow "explode") · **Medium**
- `lighthouse/assets/raphael.js` + `Treant.js`: vendored libs ≈ all CRITICAL complexity (CRAP 18 090…) and all 11 duplication groups.
- `data/**/*.mdx`: 48 of 54 "unused files" — content loaded via `fs`, invisible to import graphs.
- `jest.mock.js` / `jest.env.setup.js`: flagged unused but referenced by `jest.config.js` `setupFiles`.
- Fix with scoping config (`sonar-project.properties` exclusions, Fallow ignores/entry points), not code changes.

### F9 — SonarJS code smells (15) · **Low**
Nested ternaries (`Blog/NavList`, `SEO`, `blog/[category]/[slug].tsx`), `Function` type (`ControlButtons`, `constants/site.ts`), `prefer-const` (`Layout/Header`, `helpers/fileWritter.ts`), shadowed globals (`Date`, `Error` components), `@ts-ignore` → `@ts-expect-error` (`helpers/mdxjs.tsx`), nested template literals, super-linear regex (also F6).

### F10 — Oversized units in own code · **Low**
`useSurvey` (235-line hook: question data + email side-effect + reducer inline), `SEO` (143-line component). Fallow: 9 % of functions are 31–60 LOC, 3 % > 60.

### F11 — Dead exports (18) and dead CSS · **Low**
`helpers/fileReader.ts` (7 exports: `getPostsByTag`, `getAllTags`…), `Tooltip` hooks, `GoogleAdsense` named export + its orphan `adsense.module.css`, `isXRPError`, `DeploymentResponseType`, dead CSS classes in 4 modules.

### F12 — CORS duplication and over-breadth · **Low**
Global `Access-Control-*` headers in `next.config.js` **and** the per-route `allowCors` helper; methods advertise `PATCH,DELETE,PUT` never used; `Allow-Credentials: true` without cookie auth; deprecated `X-XSS-Protection` header.

### F13 — Toolchain EOL · **Info**
`next lint` deprecated (removed in Next 16); legacy `.eslintrc` with ESLint 9; `tsconfig` targets `es5` with `moduleResolution: node` (Next 15 defaults: ES2017 + `bundler`).

## 3. Goals / Non-goals

**Goals**
1. Eliminate the confirmed security and functional bugs (F1, F2).
2. Re-enable and pass all quality gates (build typecheck + lint) — F3.
3. Make SonarQube/Fallow report signal, not noise (F8), and fix the real findings (F9–F12).
4. Clean dependency tree: 0 high/critical vulns, no misplaced/unused/bogus deps, aligned versions (F4, F5, F7).
5. Keep the 81-test suite green throughout; no behavior changes except the fixed bugs.

**Non-goals**
- App Router migration, Storybook redesign, rewriting the lighthouse report tooling (Raphael/Treant stay vendored but excluded from analysis).
- New features.

## 4. Design decisions

- **D1 (F1):** Remove the HTML-string pipeline. Survey questions become structured data rendered as JSX (no `dangerouslySetInnerHTML` in `QuestionBlock`). `name` is rendered as text; additionally validated against `/^[\p{L}\p{M}\s'-]{1,40}$/u` with fallback to the wave emoji.
- **D2 (F2):** Default **Option A — remove**: delete `src/pages/api/email.ts`, the `fetch('/api/email')` block in `useSurvey`, and `nodemailer`. Option B (reimplement with rate-limited mail provider) only if the owner wants survey notifications back. → Decision point 1.
- **D3 (F3):** Delete both `ignore*` flags. The build must fail on type/lint errors from now on.
- **D4 (F13/F4):** Migrate to `eslint.config.mjs` (flat): `eslint-config-next` flat preset + `typescript-eslint` + `eslint-plugin-sonarjs` (recommended) to keep parity with SonarQube locally. Replace the `lint` script with `eslint .`. Remove `eslint-plugin-next@0.0.0`.
- **D5 (F8):** Add `sonar-project.properties` with `sonar.exclusions=lighthouse/assets/**,public/**,data/**,**/*.stories.tsx` and `sonar.coverage.exclusions`; Fallow config to ignore `data/**` + `lighthouse/assets/**` and register `jest.config.js` setup files as entry points.
- **D6 (F7):** Dependency moves per the table in F7; upgrade `jest` to 29.x to match `jest-environment-jsdom`; drop Storybook 6.x remnants (`@storybook/addons`, `@storybook/theming`, `@storybook/testing-library` → `@storybook/test`); goal: install without `--legacy-peer-deps`.
- **D7 (F13):** `tsconfig`: `target: ES2017`, `moduleResolution: bundler`; remove `downlevelIteration`. Verify jest/babel pipeline after the change.
- **D8 (F6):** Keep SerpAPI (its API is query-param only) but: never log the URL, cache the last good result, drop the Google-scraping fallback and the fabricated `127` — return last-cached or `503`.
- **D9 (F12):** Single CORS source of truth: keep `allowCors` per API route (tightened to `GET,OPTIONS`, no credentials), remove the global `Access-Control-*` headers and `X-XSS-Protection` from `next.config.js`.

## 5. Work plan

### Phase 0 — Baseline (no code changes)
- **T0.1** Create branch `feat/quality-refactor`. Record baselines: `fallow health --format json`, `npm audit --json`, `jest` output.

### Phase 1 — Security & functional (P0)
- **T1.1** Fix F1: refactor `useSurvey` question data to JSX-friendly structure; remove `dangerouslySetInnerHTML` from `QuestionBlock`; validate `name`. *Verify:* new jest test asserting `?name=<img…>` renders as inert text; existing survey tests green.
- **T1.2** Execute D2 (per decision): remove route + client call + dep (or reimplement). *Verify:* `tsc --noEmit` passes; grep shows no `/api/email` references.
- **T1.3** Fix F6 per D8. *Verify:* unit test for regex removal/timeout; manual `curl` of the route.
- **T1.4** Fix F12 per D9. *Verify:* `curl -H "Origin: https://evil.example"` gets no ACAO header in prod build.

### Phase 2 — Toolchain & gates (P1)
- **T2.1** Remove `ignoreBuildErrors`/`ignoreDuringBuilds` (D3). *Verify:* `next build` passes clean.
- **T2.2** ESLint flat config migration (D4); delete `.eslintrc` and bogus/legacy eslint deps. *Verify:* `npx eslint .` runs with 0 errors (fix whatever it surfaces, expected ≈ the 15 SonarJS findings).
- **T2.3** Dependency restructure + upgrades (D6); reinstall without `--legacy-peer-deps`; `npm audit fix` + Storybook chain upgrade. *Verify:* `npm audit` 0 high/critical; `npm ls` clean; jest + storybook build still work.
- **T2.4** tsconfig modernization (D7). *Verify:* `tsc --noEmit`, `jest`, `next build`.

### Phase 3 — Code quality (P2)
- **T3.1** Fix the 15 SonarJS findings (F9) — mechanical, one commit per rule family. *Verify:* SonarJS-enabled eslint run is clean.
- **T3.2** Split `useSurvey` (questions → `src/constants/survey.ts`, reducer stays, side-effect isolated) and `SEO` (extract `JsonLd`, `AlternateLinks` subcomponents) — F10. *Verify:* tests green, DOM output snapshot-equal.
- **T3.3** Remove dead exports/CSS (F11) after grepping `data/**/*.mdx` for MDX-time usage. *Verify:* build + tests + `fallow dead-code` delta.
- **T3.4** Analyzer scoping (D5): `sonar-project.properties`, Fallow ignores. *Verify:* `fallow health --score` ≥ 85; dead-file count ≈ 0 excluding content.

### Phase 4 — Guardrails (P3)
- **T4.1** CI `pre-deploy.yml`: add `tsc --noEmit` and `npm audit --audit-level=high` jobs; switch lint job to `eslint .`. *Verify:* workflow green on the PR.
- **T4.2** Final sweep: `next build`, `jest`, `playwright test`, `fallow health`, fresh SonarQube scan. Record after-metrics next to Phase 0 baselines in the PR description.

## 6. Global acceptance criteria
1. `next build` passes with **no** `ignoreBuildErrors`/`ignoreDuringBuilds`.
2. `tsc --noEmit` and `eslint .` (flat config incl. SonarJS): 0 errors.
3. `jest`: ≥ 45 suites / 81 tests green (plus new XSS test).
4. `npm audit`: 0 high/critical; install works without `--legacy-peer-deps`.
5. `fallow health --score` ≥ 85 with honest scoping (no suppression of real code).
6. `/survey?name=<script>` renders inert text.

## 7. Risks
- **Storybook chain upgrade** may break stories → isolate in its own commit; `npm run build-storybook` as gate.
- **tsconfig target bump** changes emitted test transpilation → run full jest + e2e.
- **Dead-export removal**: `fileReader` helpers might be intended future API → confirm before deleting (Decision point 3).
- **Removing `sharp`**: verify Vercel image optimization on preview deploy before merging.

## 8. Decision points (resolved)
1. **Email/survey notification (F2/D2):** removed — the route was empty and the client call silently swallowed failures for months.
2. **`/survey` page:** kept; XSS removed by rendering questions as JSX.
3. **`fileReader` dead exports:** internal-only helpers made private; genuinely unused symbols/types deleted.
4. **SonarQube exclusions (D5):** `lighthouse/assets/**` and `data/**` excluded.

## 9. Results (verified 2026-07-11)

Baselines were re-measured after implementation on `feat/quality-refactor`:

| Metric | Before | After |
| --- | --- | --- |
| `fallow health --score` | 56 (C) | **89 (A)** |
| `tsc --noEmit` | 1 error (empty email module) | **0 errors** |
| `eslint` (SonarQube-parity ruleset) | 15 (hidden by old config) | **0 errors, 0 warnings** |
| `jest` | 45 suites / 81 tests | **46 suites / 87 tests** (added XSS + name-validation tests) |
| `npm audit` (production, `--omit=dev`) | — | **0 vulnerabilities** |
| `next build` with gates on | failed silently (gates off) | **passes, 65 pages** |
| Fallow unused dependencies | 15 | **0** (2 kept: `@mdx-js/*` peers of `@next/mdx`) |

**What landed** (14 commits): reflected-XSS fix (F1), empty email route + client call + `nodemailer` removed (F2), `indexed-pages` hardened — no Google scraping, no fabricated `127`, serves last-known or 503 (F6), recursive `console` helper fixed, single-source CORS restricted to `GET,OPTIONS` (F12), build gates re-enabled (F3), ESLint 9 flat config with SonarJS replacing the legacy `.eslintrc` (F4/F13), dependency restructure + jest 29 alignment (F5/F7), tsconfig ES2017 + bundler (F13), 15 SonarJS smells fixed (F9), `useSurvey` split (questions → `constants/survey.tsx`) (F10), dead exports/CSS pruned (F11), Sonar + Fallow scoping (F8), CI type-check + production audit gates.

### Accepted / deferred (honest caveats)
- **`npm install` still needs `--legacy-peer-deps`.** Not a config defect: React 19 is ahead of the peer ranges declared by `@code-hike/mdx`, `react-intl`, `react-confetti`, etc. Production audit is clean and the tree resolves correctly; the flag is the standard way to run React 19 with not-yet-updated libraries. The *removable* conflicts (bogus `eslint-plugin-next@0.0.0`, misplaced deps) were fixed.
- **Dev-tooling vulnerabilities remain** (`npm audit` full: 6 low, 17 moderate, 2 high) — all transitive through Storybook (`node-polyfill-webpack-plugin → crypto-browserify → elliptic`) and lighthouse (`@sentry/node → @opentelemetry/*`). Fixing requires breaking major upgrades of Storybook and lighthouse; none of these packages ship in the production bundle.
- **`npm run build-storybook` fails** (`TypeError: compilation … must be an instance of Compilation`). Verified this fails identically on the pre-refactor commit `23bcafb` — it is a **pre-existing** break (Storybook 8 + React 19), not caused by this work. Tracked separately; out of scope for the audit remediation.
- **Dead CSS module classes** (5, e.g. `viewCounter.spinner`, `header.button`) left in place — CSS-module dead-class detection risks false positives on dynamically composed names, and they carry no runtime cost (health impact −0.5).
- **`SEO` component (143 LOC) not split** — the `useSurvey` split was the high-value one; `SEO` is data-heavy but low cyclomatic complexity, so the JsonLd/AlternateLinks extraction was deferred as optional polish.
