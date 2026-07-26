// Trending content radar runner (SDD-006). Usage: `npm run trending` — prints the
// markdown report to stdout. Every source is optional: a failed fetch is logged to
// stderr and skipped, the radar never exits non-zero because one upstream is down.
// SDD-L11-T2: a malformed payload now surfaces here as a loud, named validation
// error from lib.ts (`[trending] hn skipped: hn payload invalid: hits …`) instead
// of a silently thinner report. Runs under Node's type stripping — relative imports
// carry explicit `.ts` extensions and tsconfig paths are unavailable.
import * as z from 'zod/mini';
import { describeIssues } from '../../src/types/schemas.ts';
import { normalize, scoreItem, dedupeByUrl, buildReport, PROFILE } from './lib.ts';
import type { NormalizedItem } from './lib.ts';

const TOP_N = 8;
const OWNER = 'xabierlameiro';
const QUERY_KEYWORDS = ['nextjs', 'react', 'claude ai', 'mcp server', 'playwright'];
const SUBREDDITS = ['reactjs', 'nextjs', 'webdev', 'ClaudeAI'];
const USER_AGENT = 'trending-radar/1.0 (+https://xabierlameiro.com)';
// Stack repos to mine for recurring, high-engagement open issues (SDD-011).
// `react/react` is the current name: the repository moved from `facebook/react`, and the
// search API answers 422 — not an empty result — for the old one.
const ISSUE_REPOS = [
    'vercel/next.js',
    'react/react',
    'microsoft/TypeScript',
    'nodejs/node',
    'jestjs/jest',
    'storybookjs/storybook',
    'microsoft/playwright',
];

const fetchJson = async (url: string): Promise<unknown> => {
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
};

/**
 * @description Run one request per input and keep whatever succeeds.
 *
 * Every source used to fan out with `Promise.all`, which rejects on the first failure — so a
 * single dead input discarded all its siblings. That is not hypothetical: `githubIssues` queried
 * `facebook/react` after the repository was renamed, the search API answered 422, and the whole
 * GitHub-issues source (all seven repos) contributed nothing to the radar for as long as the name
 * stayed stale, behind one line of stderr. One bad input must cost one input.
 *
 * Normalization runs inside the per-input task on purpose, so a validation failure is isolated the
 * same way a network failure is.
 */
const collectEach = async <Input>(
    source: string,
    inputs: readonly Input[],
    collectOne: (input: Input) => Promise<NormalizedItem[]>,
): Promise<NormalizedItem[]> => {
    const settled = await Promise.allSettled(inputs.map(collectOne));
    return settled.flatMap((result, index) => {
        if (result.status === 'fulfilled') return result.value;
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error(`[trending] ${source}:${String(inputs[index])} skipped: ${reason}`);
        return [];
    });
};

const collectors = {
    hackerNews: () => {
        const since = Math.floor(Date.now() / 1000) - 7 * 86400;
        return collectEach('hackerNews', QUERY_KEYWORDS, async (keyword) =>
            normalize.hn(
                await fetchJson(
                    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
                        keyword,
                    )}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=10`,
                ),
            ),
        );
    },
    devto: () =>
        collectEach('devto', ['nextjs', 'react', 'typescript', 'ai', 'testing'], async (tag) =>
            normalize.devto(await fetchJson(`https://dev.to/api/articles?tag=${tag}&top=7&per_page=10`)),
        ),
    reddit: () =>
        collectEach('reddit', SUBREDDITS, async (subreddit) =>
            normalize.reddit(await fetchJson(`https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=15`)),
        ),
    github: () => {
        // One request per topic: the search API rejects OR between topic qualifiers (422)
        const since = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
        return collectEach('github', ['nextjs', 'claude', 'mcp'], async (topic) =>
            normalize.github(
                await fetchJson(
                    `https://api.github.com/search/repositories?q=created:%3E${since}+topic:${topic}&sort=stars&order=desc&per_page=10`,
                ),
            ),
        );
    },
    // Most-commented open issues per stack repo — recurring, evergreen developer pain.
    githubIssues: () =>
        collectEach('githubIssues', ISSUE_REPOS, async (repo) =>
            normalize.githubIssues(
                await fetchJson(
                    `https://api.github.com/search/issues?q=${encodeURIComponent(
                        `repo:${repo} type:issue state:open`,
                    )}&sort=comments&order=desc&per_page=8`,
                ),
            ),
        ),
};

// GitHub documents name/html_url as always present; pushed_at may be null on empty repos.
const ownerReposSchema = z.array(
    z.object({
        name: z.string(),
        html_url: z.string(),
        pushed_at: z.optional(z.nullable(z.string())),
    }),
);

const collectRecentRepos = async (): Promise<{ name: string; url: string; pushedAt: string | undefined }[]> => {
    const result = ownerReposSchema.safeParse(
        await fetchJson(`https://api.github.com/users/${OWNER}/repos?sort=pushed&per_page=8`),
    );
    if (!result.success) throw new Error(`recentRepos payload invalid: ${describeIssues(result.error.issues)}`);
    return result.data.map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        pushedAt: repo.pushed_at ?? undefined,
    }));
};

// Rising queries from the owner's own Search Console — optional, needs the same
// service-account env vars as /api/analytics. Skipped silently when absent.
const collectRisingQueries = async (): Promise<{ query: string; impressions: number; delta: number }[]> => {
    if (!process.env.ANALYTICS_CLIENT_EMAIL || !process.env.ANALYTICS_PRIVATE_KEY) return [];
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
    });
    const webmasters = google.webmasters({ version: 'v3', auth });
    const day = (offset: number): string => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
    const query = async (startDate: string, endDate: string): Promise<Map<string, number>> => {
        const response = await webmasters.searchanalytics.query({
            siteUrl: 'sc-domain:xabierlameiro.com',
            requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 250 },
        });
        const entries: [string, number][] = [];
        for (const row of response.data.rows ?? []) {
            const term = row.keys?.[0];
            if (term !== undefined) entries.push([term, row.impressions ?? 0]);
        }
        return new Map(entries);
    };
    const [current, previous] = await Promise.all([query(day(28), day(0)), query(day(56), day(28))]);
    return [...current.entries()]
        .map(([term, impressions]) => ({ query: term, impressions, delta: impressions - (previous.get(term) ?? 0) }))
        .filter(({ delta }) => delta > 5)
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10);
};

const runCollector = async <T>(name: string, collector: () => Promise<T[]>): Promise<T[]> => {
    try {
        return await collector();
    } catch (error) {
        console.error(`[trending] ${name} skipped: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};

const main = async (): Promise<void> => {
    const now = Date.now();
    const [hn, devto, reddit, github, githubIssues, recentRepos, risingQueries] = await Promise.all([
        runCollector('hackerNews', collectors.hackerNews),
        runCollector('devto', collectors.devto),
        runCollector('reddit', collectors.reddit),
        runCollector('github', collectors.github),
        runCollector('githubIssues', collectors.githubIssues),
        runCollector('recentRepos', collectRecentRepos),
        runCollector('risingQueries', collectRisingQueries),
    ]);

    const topics = dedupeByUrl(
        [...hn, ...devto, ...reddit, ...github, ...githubIssues]
            .map((item) => ({ ...item, ...scoreItem(item, now) }))
            .filter(({ score }) => score > 0),
    )
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_N);

    process.stdout.write(
        buildReport(topics, {
            generatedAt: new Date(now).toISOString().slice(0, 10),
            risingQueries,
            recentRepos,
        }),
    );
    console.error(`[trending] done: ${topics.length} topics from ${PROFILE.keywords.length} profile keywords`);
};

main();
