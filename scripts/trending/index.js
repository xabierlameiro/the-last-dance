// Trending content radar runner (SDD-006). Usage: `npm run trending` — prints the
// markdown report to stdout. Every source is optional: a failed fetch is logged to
// stderr and skipped, the radar never exits non-zero because one upstream is down.
import { normalize, scoreItem, dedupeByUrl, buildReport, PROFILE } from './lib.js';

const TOP_N = 8;
const OWNER = 'xabierlameiro';
const QUERY_KEYWORDS = ['nextjs', 'react', 'claude ai', 'mcp server', 'playwright'];
const SUBREDDITS = ['reactjs', 'nextjs', 'webdev', 'ClaudeAI'];
const USER_AGENT = 'trending-radar/1.0 (+https://xabierlameiro.com)';

const fetchJson = async (url) => {
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
};

const collectors = {
    hackerNews: async () => {
        const since = Math.floor(Date.now() / 1000) - 7 * 86400;
        const batches = await Promise.all(
            QUERY_KEYWORDS.map((keyword) =>
                fetchJson(
                    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
                        keyword
                    )}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=10`
                )
            )
        );
        return batches.flatMap(normalize.hn);
    },
    devto: async () => {
        const tags = ['nextjs', 'react', 'typescript', 'ai', 'testing'];
        const batches = await Promise.all(
            tags.map((tag) => fetchJson(`https://dev.to/api/articles?tag=${tag}&top=7&per_page=10`))
        );
        return batches.flatMap(normalize.devto);
    },
    reddit: async () => {
        const batches = await Promise.all(
            SUBREDDITS.map((subreddit) =>
                fetchJson(`https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=15`)
            )
        );
        return batches.flatMap(normalize.reddit);
    },
    github: async () => {
        const since = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
        const json = await fetchJson(
            `https://api.github.com/search/repositories?q=created:%3E${since}+topic:nextjs+OR+topic:claude+OR+topic:mcp&sort=stars&order=desc&per_page=15`
        );
        return normalize.github(json);
    },
};

const collectRecentRepos = async () => {
    const repos = await fetchJson(`https://api.github.com/users/${OWNER}/repos?sort=pushed&per_page=8`);
    return (Array.isArray(repos) ? repos : []).map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        pushedAt: repo.pushed_at,
    }));
};

// Rising queries from the owner's own Search Console — optional, needs the same
// service-account env vars as /api/analytics. Skipped silently when absent.
const collectRisingQueries = async () => {
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
    const day = (offset) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
    const query = async (startDate, endDate) => {
        const response = await webmasters.searchanalytics.query({
            siteUrl: 'sc-domain:xabierlameiro.com',
            requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 250 },
        });
        return new Map((response.data.rows ?? []).map((row) => [row.keys?.[0], row.impressions ?? 0]));
    };
    const [current, previous] = await Promise.all([query(day(28), day(0)), query(day(56), day(28))]);
    return [...current.entries()]
        .map(([term, impressions]) => ({ query: term, impressions, delta: impressions - (previous.get(term) ?? 0) }))
        .filter(({ delta }) => delta > 5)
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 10);
};

const runCollector = async (name, collector) => {
    try {
        return await collector();
    } catch (error) {
        console.error(`[trending] ${name} skipped: ${error.message}`);
        return [];
    }
};

const main = async () => {
    const now = Date.now();
    const [hn, devto, reddit, github, recentRepos, risingQueries] = await Promise.all([
        runCollector('hackerNews', collectors.hackerNews),
        runCollector('devto', collectors.devto),
        runCollector('reddit', collectors.reddit),
        runCollector('github', collectors.github),
        runCollector('recentRepos', collectRecentRepos),
        runCollector('risingQueries', collectRisingQueries),
    ]);

    const topics = dedupeByUrl(
        [...hn, ...devto, ...reddit, ...github]
            .map((item) => ({ ...item, ...scoreItem(item, now) }))
            .filter(({ score }) => score > 0)
    )
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_N);

    process.stdout.write(
        buildReport(topics, {
            generatedAt: new Date(now).toISOString().slice(0, 10),
            risingQueries,
            recentRepos,
        })
    );
    console.error(`[trending] done: ${topics.length} topics from ${PROFILE.keywords.length} profile keywords`);
};

main();
