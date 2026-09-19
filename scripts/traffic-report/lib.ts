// Pure half of the traffic report (measure-real-traffic): argument parsing, GA4 row validation and
// the markdown output. index.ts does the I/O. Runs under Node's type stripping — relative imports
// carry explicit `.ts` extensions and tsconfig paths are unavailable.
import * as z from 'zod';

// Must equal AI_CRAWLER_HIT_EVENT in src/helpers/aiCrawler.ts. That module cannot be imported from
// here (it resolves `@/` paths, which type stripping does not), so a test pins the two together.
export const CRAWLER_EVENT_NAME = 'ai_crawler_hit';
export const TOP_PATHS = 10;

export type ReportOptions = {
    from: string;
    to: string;
    humanVisits?: number;
    aiReferrals: Record<string, number>;
};

export type CountRow = { key: string; count: number };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

const readFlag = (argv: string[], name: string): string | undefined => {
    const index = argv.indexOf(`--${name}`);
    return index === -1 ? undefined : argv[index + 1];
};

/**
 * @description `source=count` pairs separated by commas, e.g. `chatgpt.com=3,perplexity.ai=1`,
 * copied from the referrer panel of Vercel Web Analytics (it has no read API).
 */
const parseReferrals = (raw: string | undefined): Record<string, number> => {
    if (!raw) return {};
    return Object.fromEntries(
        raw.split(',').map((pair) => {
            const [source, count] = pair.split('=');
            const visits = Number(count);
            if (!source || !Number.isInteger(visits) || visits < 0) {
                throw new Error(`--ai-referrals: "${pair}" is not source=count (e.g. chatgpt.com=3)`);
            }
            return [source.trim(), visits];
        })
    );
};

export const parseReportArgs = (argv: string[]): ReportOptions => {
    const from = isoDate.safeParse(readFlag(argv, 'from'));
    const to = isoDate.safeParse(readFlag(argv, 'to'));
    if (!from.success || !to.success) {
        throw new Error('usage: npm run traffic-report -- --from YYYY-MM-DD --to YYYY-MM-DD [--human N] [--ai-referrals chatgpt.com=3,perplexity.ai=1]');
    }
    if (from.data > to.data) throw new Error(`--from ${from.data} is after --to ${to.data}`);

    const rawHuman = readFlag(argv, 'human');
    const humanVisits = rawHuman === undefined ? undefined : Number(rawHuman);
    if (humanVisits !== undefined && (!Number.isInteger(humanVisits) || humanVisits < 0)) {
        throw new Error(`--human must be a non-negative integer, got "${rawHuman}"`);
    }

    return { from: from.data, to: to.data, humanVisits, aiReferrals: parseReferrals(readFlag(argv, 'ai-referrals')) };
};

const reportRowsSchema = z.object({
    rows: z
        .array(
            z.object({
                dimensionValues: z.array(z.object({ value: z.string() })).min(1),
                metricValues: z.array(z.object({ value: z.string() })).min(1),
            })
        )
        .nullish(),
});

/**
 * @description Validate a GA4 `runReport` response with one dimension and one metric. GA4 omits
 * `rows` entirely when nothing matched, which is a valid empty result, not an error.
 */
export const parseReportRows = (response: unknown): CountRow[] => {
    const parsed = reportRowsSchema.parse(response);
    return (parsed.rows ?? []).map((row) => ({
        key: row.dimensionValues[0]!.value,
        count: Number(row.metricValues[0]!.value),
    }));
};

const table = (heading: string, rows: CountRow[], emptyNote: string): string[] => {
    if (rows.length === 0) return [`| ${heading} | Count |`, '| --- | ---: |', `| ${emptyNote} | 0 |`];
    return [`| ${heading} | Count |`, '| --- | ---: |', ...rows.map((row) => `| ${row.key} | ${row.count} |`)];
};

export const formatTrafficReport = (options: ReportOptions, byBot: CountRow[], byPath: CountRow[]): string => {
    const totalCrawlerHits = byBot.reduce((sum, row) => sum + row.count, 0);
    const referralRows = Object.entries(options.aiReferrals).map(([key, count]) => ({ key, count }));

    return [
        `# Traffic report ${options.from} → ${options.to}`,
        '',
        '## Humans (Vercel Web Analytics, cookieless)',
        '',
        `- Visitors: ${options.humanVisits ?? 'not provided (pass --human)'}`,
        '',
        ...table('AI referral source', referralRows, 'not provided (pass --ai-referrals)'),
        '',
        `## AI crawlers (GA4 \`${CRAWLER_EVENT_NAME}\`) — ${totalCrawlerHits} requests`,
        '',
        ...table('Bot', byBot, 'no crawler hits recorded'),
        '',
        `### Top ${TOP_PATHS} crawled paths`,
        '',
        ...table('Path', byPath, 'no crawler hits recorded'),
        '',
        '> Crawler counts cover declared user agents only. Pages served from the CDN cache may skip the',
        '> middleware; see measure-real-traffic tasks 5.1 for whether that happens on this deployment.',
    ].join('\n');
};
