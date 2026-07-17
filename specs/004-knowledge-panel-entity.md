# SDD-004: "Xabier Lameiro" as a Google entity (Knowledge Panel + photo)

-   **Goal**: searching "Xabier Lameiro" shows a Knowledge Panel with photo, like a public figure.
-   **Status**: on-site workstream A implemented 2026-07-17 (canonical name, ProfilePage at
    /about, enriched Person with `@id`, headshot at /xabier-lameiro.png, X added to sameAs).
    Workstreams B (Wikidata + external corroboration) and C (demand + measurement) are
    off-site, owner-driven, and remain open.
-   **Expectation setting**: Knowledge Panels are generated from Google's Knowledge Graph.
    They cannot be requested or bought; structured data alone does not create one. Google must
    be able to _reconcile_ the entity across independent sources. Realistic horizon:
    months to a year of sustained off-site work; success is probable-not-guaranteed.

## Current state (measured 2026-07-17)

-   Google barely associates the domain with the name: "lameiro" = 6 impressions at
    position ~46 over 6.5 months; "xabier lameiro" = zero recorded impressions.
-   `Person` JSON-LD exists but is duplicated and inconsistent (SDD-002 D4).
-   Name inconsistency: "Xabier Lameiro Cardama" (schema) vs "Xabier Lameiro" (title/brand).
-   `sameAs` covers only LinkedIn, GitHub, Reddit — while `twitter:site` references
    `@xlameirodev`, which is absent from `sameAs`.

## Workstreams

### A. On-site entity home (prerequisite: SDD-002 D4)

1. Pick **one** canonical name form everywhere — recommend **"Xabier Lameiro"** —
   and move "Xabier Lameiro Cardama" to `alternateName`.
2. Create `/about` marked up as `ProfilePage` whose `mainEntity` is the Person `@id`.
   Enrich the Person node: `image` (professional headshot ≥600px as `ImageObject`),
   `jobTitle`, `knowsAbout`, `alumniOf`, complete `sameAs`, `url`.
3. Image SEO for the photo-next-to-name goal: one headshot file reused across the site
   and all profiles (`/xabier-lameiro.jpg`, alt "Xabier Lameiro"), referenced from the
   Person node and indexable in Google Images.

### B. Corroboration graph (the actual driver)

1. Profile audit: LinkedIn, GitHub, X (`@xlameirodev`), npm, Stack Overflow, dev.to/Medium —
   same name, same photo, each linking back to xabierlameiro.com; add all to `sameAs`.
2. Create a **Wikidata** item (Person) with acceptable references (conference/talk pages,
   press, employer pages — not self-published profiles). Wikidata feeds the Knowledge
   Graph directly. Do **not** attempt Wikipedia — its notability bar is much higher and
   a deleted article hurts.
3. Earn independent mentions: conference talks, podcasts, guest articles, open-source
   visibility. Each is a source Google can reconcile against the site.

### C. Demand + measurement

1. Generate brand-query demand: publish/share content under the exact name (talks,
   LinkedIn posts linking to the blog) so people search "xabier lameiro".
2. Track monthly:
    - GSC brand-query impressions/position (`query contains "lameiro"`).
    - Knowledge Graph Search API (`kgsearch.googleapis.com`) for the entity.
    - Manual SERP check per locale.
3. The moment a panel appears → **"Claim this knowledge panel"** (Google account
   verification) → then suggest the headshot via the claimed-panel controls. The photo
   next to the name is granted at this stage, not before.

## Out of scope / anti-goals

Buying placements, requesting panels through support, Wikipedia article, or relying on
schema markup alone.

## Acceptance criteria (staged)

1. `kgsearch` returns a "Xabier Lameiro" entity.
2. Brand query "xabier lameiro" reaches ≥100 impressions/month with the site at position ≤3.
3. Knowledge Panel visible in at least one locale; panel claimed; photo suggested/approved.
