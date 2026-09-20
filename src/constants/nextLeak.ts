/**
 * Data behind /next-leak. Every figure here is copied from the next-leak README as it stood on
 * `checkedAt`, never rounded or extrapolated: the page is only worth citing if a reader can find the
 * same number in the tool's own repository. Update this file, and the date, when the README changes.
 *
 * Route names, measurements, retainer chains and issue rows are data, not copy. They stay in English
 * in every locale, the way the CLI prints them, and are kept out of the message catalogues.
 */

export type Verdict = 'stable' | 'leak' | 'saturating' | 'inconclusive' | 'failed';

export type RouteResult = {
    route: string;
    verdict: Verdict;
    slope: string;
    /** Heap after a forced GC, once per cycle, in MB. */
    samples: number[];
    /** The object at the head of the retainer chain, as the table cell shows it. */
    holder?: string;
    retainer?: string;
};

export type IssueRow = {
    issue: number;
    what: string;
    measured: string;
    state:
        | { kind: 'fixed'; version: string }
        | { kind: 'closed' }
        | { kind: 'open'; fixProposed?: { label: string; url: string } };
};

export const VERDICTS: Verdict[] = ['stable', 'leak', 'saturating', 'inconclusive', 'failed'];

const exampleRoutes: RouteResult[] = [
    {
        route: '/api/heap',
        verdict: 'leak',
        slope: '+4.70 MB/1000 req',
        samples: [28.7, 40.3, 59.0, 75.8, 75.9, 101.2, 101.2, 139.0, 139.0],
        holder: 'TimeoutsManager#object',
        retainer:
            'grown [object] Array 112.5 MB — TimeoutsManager#object[.resources] <- system / Context#object[.timeoutsManager] <- destroy#closure[.context] <- ResourceManager#object[.properties] <- IntervalsManager#object[.map]',
    },
    {
        route: '/',
        verdict: 'stable',
        slope: '+0.02 MB/1000 req',
        samples: [40.9, 35.3, 35.3, 35.4],
    },
    {
        route: '/convenio',
        verdict: 'stable',
        slope: '+0.02 MB/1000 req',
        samples: [36.3, 37.0, 37.1, 37.1],
    },
];

const issues: IssueRow[] = [
    {
        issue: 97938,
        what: 'use cache / cacheComponents: AbortSignal.any composites never released',
        measured: '+705 KB per request on 16.3.3, flat on 16.2.6',
        state: { kind: 'fixed', version: '16.3.5' },
    },
    {
        issue: 84884,
        what: "axios + AbortSignal in middleware: a reference cycle through undici's Request finalizer",
        measured: '+17.02 MB/1000 req on 16.3.5 (Node 24.18), +4.62 (Node 24.21); flat with scope hoisting off',
        state: {
            kind: 'open',
            fixProposed: { label: 'nodejs/undici#5822', url: 'https://github.com/nodejs/undici/pull/5822' },
        },
    },
    {
        issue: 98707,
        what: 'next dev: a route handler compiled after N pages costs ~16 MB × N',
        measured: '851 MB on 16.3.0-canary.100, 2,354 MB on canary.101, 1,704 MB on 16.3.5',
        state: { kind: 'open' },
    },
    {
        issue: 96533,
        what: 'ISR revalidation holds RSC buffers between collections',
        measured: '4–5 MB of arrayBuffers held vs 0.32 MB retained',
        state: { kind: 'open' },
    },
    {
        issue: 92287,
        what: 'Cache Components: unbounded arrayBuffers under load',
        measured: '37.5 MB of arrayBuffers held between collections, 37x what it retains (16.3.1)',
        state: { kind: 'open' },
    },
    {
        issue: 89091,
        what: 'zlib retention on mid-stream aborts',
        measured: '+42.5 MB/1000 aborted req on 16.1.5; +0.03 on 16.3.1',
        state: { kind: 'closed' },
    },
    {
        issue: 95094,
        what: 'Middleware setTimeout ids retained by the sandbox',
        measured: '112 MB retained; flat after the fix',
        state: { kind: 'fixed', version: '16.3.0' },
    },
    {
        issue: 94890,
        what: "Router LRU cache doesn't count its keys",
        measured: '26.7 → 71.9 MB',
        state: { kind: 'fixed', version: '16.3.0' },
    },
    {
        issue: 94919,
        what: 'Retention on client aborts',
        measured: '39 → 139 MB',
        state: { kind: 'fixed', version: '16.3.0' },
    },
];

export const nextLeak = {
    version: '0.11.3',
    checkedAt: '2026-09-19',
    install: 'npx next-leak .',
    ritual: 'warm-up → forced GC → baseline snapshot → [load → idle → GC → sample] ×4 → snapshot',
    buildCommand: 'npx next-leak build .',
    repository: 'https://github.com/xabierlameiro/next-leak',
    npm: 'https://www.npmjs.com/package/next-leak',
    /**
     * A third-party reader for the npm registry. It is listed because it shows what npmjs.com does
     * not put on one screen — install size, the dependency tree, the vulnerability count and the
     * download history — and it needs no account. It is NOT in the JSON-LD `sameAs`: that field
     * claims a profile belongs to the project, and this one belongs to whoever runs npmx.
     */
    npmx: 'https://npmx.dev/package/next-leak',
    readme: 'https://github.com/xabierlameiro/next-leak#readme',
    newIssue: 'https://github.com/xabierlameiro/next-leak/issues',
    /** Healthy routes on production apps (PPR, MDX, Auth.js, Sentry, i18n) with zero false positives. */
    healthyRoutes: 25,
    post: {
        en: {
            href: '/blog/nextjs/nextjs-memory-leak-in-production',
            title: 'How to find a Next.js memory leak in production',
        },
        es: {
            href: '/blog/nextjs/fuga-de-memoria-nextjs-en-produccion',
            title: 'Cómo encontrar una fuga de memoria de Next.js en producción',
        },
        gl: {
            href: '/blog/nextjs/fuga-de-memoria-nextjs-en-producion',
            title: 'Como atopar unha fuga de memoria de Next.js en produción',
        },
    },
    /** A real run against the reproduction for vercel/next.js#95094, which Next 16.3.0 fixed. */
    exampleRun: {
        issue: 95094,
        fixedIn: '16.3.0',
        routes: exampleRoutes,
        /** The same app before and after the workaround from the thread, identical parameters. */
        proof: { found: '28.7 → 138.9 MB', cycles: 8, workaround: 'clearTimeout(id)', after: '27.8 → 25.6 MB' },
    },
    /** The #97464 reproduction, 2,504 prerendered pages. */
    build: {
        issue: 97464,
        pages: 2504,
        leaking: { version: '16.3.3', runs: [1617, 1525], fixedIn: '16.3.5', sameFixAs: 97938 },
        healthy: { version: '16.2.12', perPage: '0.05 MB' },
        parent: { from: '1.43 GB', to: '0.10 GB' },
    },
    issues,
};

export const nextJsIssueUrl = (issue: number) => `https://github.com/vercel/next.js/issues/${issue}`;
