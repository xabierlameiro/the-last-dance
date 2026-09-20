/**
 * Data behind /next-coverage. Same contract as `nextLeak.ts`: every figure is copied from a real run
 * of the published CLI on `checkedAt`, never rounded, never extrapolated. A reader has the repo, the
 * commit and the version, so they can reproduce the whole page in about a minute.
 *
 * The tool is 0.x and its own CHANGELOG says the CLI and the JSON may change between minors, so this
 * file and its date move together with the version above them.
 *
 * Bucket names, finding text and file paths are data, not copy: they stay in English in every locale,
 * the way the CLI prints them, and never enter the message catalogues.
 */

export type Bucket = 'used' | 'wouldApply' | 'notApplicable' | 'notEvaluated';

export type Finding = {
    /** The API entry the finding hangs off, as the report labels it. */
    api: string;
    group: string;
    /** The report's own sentence, verbatim. */
    what: string;
    /** The one-line reason the report prints under it. */
    why: string;
    docs: string;
    /** Files named by the report; `more` is how many it summarised as "and N more". */
    files: string[];
    more?: number;
    /** Present only on the finding the page leads with. */
    detail?: string;
};

export const BUCKETS: Bucket[] = ['used', 'wouldApply', 'notApplicable', 'notEvaluated'];

const findings: Finding[] = [
    {
        api: 'cacheTag',
        group: 'functions',
        what: 'declared here, and no invalidation names them anywhere in the project',
        why: 'a tag lets revalidateTag drop exactly these scopes, so a change reaches the page without waiting out the profile',
        docs: 'https://nextjs.org/docs/app/api-reference/functions/cacheTag',
        files: ['features/product/product-queries.ts'],
        detail: 'products',
    },
    {
        api: 'cacheLife',
        group: 'functions',
        what: 'these cache scopes inherit the default profile because they never set one',
        why: 'a profile sets how long the scope is fresh and how long it may be served stale, instead of the framework’s default',
        docs: 'https://nextjs.org/docs/app/api-reference/functions/cacheLife',
        files: [
            'features/category/components/Categories.tsx',
            'features/category/components/CategoryFilters.tsx',
            'features/category/components/FeaturedCategories.tsx',
        ],
        more: 8,
    },
    {
        api: 'sitemap.xml',
        group: 'file-conventions',
        what: 'the project serves 7 pages and declares no sitemap',
        why: 'a sitemap file generates the XML from the routes, so crawlers find every page rather than the ones something links to',
        docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap',
        files: ['app'],
    },
];

/** Modules on the client side of the boundary, per route, from the same run. */
const clientWeight = [
    { route: '/all', modules: 20 },
    { route: '/', modules: 16 },
    { route: '/product/[id]', modules: 15 },
    { route: '/cart', modules: 12 },
    { route: '/user', modules: 12 },
];

export const nextCoverage = {
    version: '0.1.0',
    /** The run below, and the hand check under it, were made on this date. */
    checkedAt: '2026-09-20',
    install: 'npx next-coverage',
    strict: 'npx next-coverage --strict --findings',
    requirements: 'Node.js 20.19+, Next.js 16.2+, App Router',
    repository: 'https://github.com/xabierlameiro/next-coverage',
    npm: 'https://www.npmjs.com/package/next-coverage',
    npmx: 'https://npmx.dev/package/next-coverage',
    newIssue: 'https://github.com/xabierlameiro/next-coverage/issues',
    exampleRun: {
        project: 'aurorascharff/next16-commerce',
        projectUrl: 'https://github.com/aurorascharff/next16-commerce',
        commit: '13d17c0f21ee742cec914078480d4a008c51f782',
        commitShort: '13d17c0f',
        commitUrl: 'https://github.com/aurorascharff/next16-commerce/tree/13d17c0f21ee742cec914078480d4a008c51f782',
        nextVersion: '16.3.0-preview.10',
        header: 'next-coverage · Next.js 16.3.0-preview.10 · ~/next16-commerce',
        seconds: 1.2,
        entries: 151,
        evaluated: 30,
        summary: '29 of 30 evaluated APIs are in use.',
        counts: { used: 29, wouldApply: 1, notApplicable: 8, notEvaluated: 113 },
        /** The report breaks its own silence down, which is the point of showing it. */
        notEvaluatedBreakdown: [
            { count: 32, what: 'abstained' },
            { count: 5, what: 'suggested on another entry' },
            { count: 72, what: 'evaluated and unmatched' },
        ],
        findings,
        findingsInStrict: 14,
        withheld: 65,
        constraintsChecked: 13,
        clientWeight,
        clientWeightMoreRoutes: 2,
        /** No build was present, and the report says so rather than guessing. */
        buildContrast: 'nothing contrasted: no production build found at .next',
    },
    /**
     * The lead finding, checked by reading the project rather than by trusting the tool. Line numbers
     * are from the pinned commit.
     */
    verification: {
        declares:
            "features/product/product-queries.ts:47 — getProducts declares 'use cache', cacheLife('minutes') and cacheTag('products')",
        alsoDeclares: "features/product/components/{Product,ProductDetails}.tsx — cacheTag('product-' + productId)",
        invalidates:
            "features/product/product-actions.ts:54 — setFeaturedProduct changes the featured product and calls revalidateTag('featured-product', 'max')",
        conclusion: 'Nothing in the project ever names products or product-<id>.',
    },
} as const;
