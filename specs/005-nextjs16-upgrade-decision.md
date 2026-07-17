# SDD-005: Next.js 16 upgrade — go/no-go

-   **Decision**: **NO-GO for now.** Polish v15 and ship SDD-001/002/003 first; revisit
    around Q4 2026 as a fresh spec once the preconditions below hold. Confidence: high.

## Current stack (audited 2026-07-17)

-   `next` 15.5.9 — **Pages Router** + built-in i18n (`en`/`es`/`gl`)
-   React 19.1, TypeScript 5.8 — but `typescript.ignoreBuildErrors: true` and
    `eslint.ignoreDuringBuilds: true` in `next.config.js`
-   Jest 28 (+ jsdom), Storybook 8.4 (`@storybook/nextjs`), Playwright
-   `webpack` 5 pinned as a direct dependency; `@code-hike/mdx` 0.8 (webpack-era) in the MDX pipeline
-   Node engines `>=20`

## Next.js 16 facts (verified against the official upgrade guide, 2026-07-17)

-   Requires Node ≥20.9, TypeScript ≥5.1, React ≥18.2 — **we comply**.
-   **Pages Router remains fully supported, including built-in i18n** — upgrading does NOT
    force an App Router migration.
-   Turbopack becomes the default bundler; the webpack path is legacy →
    `@code-hike/mdx` + the pinned webpack are the main compatibility risk.
-   `next lint` removed (our `lint` script uses it), AMP removed (unused),
    `middleware` → `proxy` rename (unused), `next/legacy/image` deprecated (unused),
    async-only request APIs affect App Router only (not us).
-   Ecosystem: `@storybook/nextjs` 8.4 does not certify Next 16 — implies a Storybook 9/10
    migration on top.

## Why NO-GO now

1. **Zero ROI on the actual goals.** Nothing in 16 improves SEO, AdSense readiness, the
   broken widgets, or content. Every active workstream (SDD-001..004) runs fine on 15.5.
2. **Hidden type debt.** Builds currently ignore TypeScript and ESLint errors. Upgrading a
   major on top of an unchecked codebase multiplies risk; re-enabling those gates comes first.
3. **It's really 3 migrations**: Next 16 + Storybook major + MDX/code-hike-on-Turbopack.
4. **No forcing function**: 15.5 still receives security fixes.

## Preconditions to revisit (open SDD-006 when all are checked)

-   [ ] `ignoreBuildErrors: false` and `ignoreDuringBuilds: false` with a green build
-   [ ] Storybook ≥9 (or a decision to drop Storybook)
-   [ ] Test runner modernized (Jest 28 → current Jest or Vitest)
-   [ ] `@code-hike/mdx` replaced (e.g. `rehype-pretty-code`/shiki) or validated on Turbopack;
        `lint` script migrated off `next lint`
-   [ ] SDD-002/003 shipped and re-indexation confirmed in GSC

> Note: the local unmerged branch `feat/quality-refactor` (2026-07-11) already re-enables the
> build gates and modernizes Jest — merging it satisfies the first and third preconditions.
> That merge is the recommended first move regardless of this upgrade decision.
