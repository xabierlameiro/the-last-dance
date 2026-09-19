import { AI_CRAWLER_HIT_EVENT } from '@/helpers/aiCrawler';
import { CRAWLER_EVENT_NAME, formatTrafficReport, parseReportArgs, parseReportRows } from '../lib';

describe('CRAWLER_EVENT_NAME', () => {
    it('is the event the middleware sends', () => {
        expect(CRAWLER_EVENT_NAME).toBe(AI_CRAWLER_HIT_EVENT);
    });
});

describe('parseReportArgs', () => {
    it('reads the date range and the optional human figures', () => {
        expect(
            parseReportArgs([
                '--from',
                '2026-09-01',
                '--to',
                '2026-09-28',
                '--human',
                '412',
                '--ai-referrals',
                'chatgpt.com=3,perplexity.ai=1',
            ])
        ).toEqual({
            from: '2026-09-01',
            to: '2026-09-28',
            humanVisits: 412,
            aiReferrals: { 'chatgpt.com': 3, 'perplexity.ai': 1 },
        });
    });

    it('leaves the human figures empty when not given', () => {
        expect(parseReportArgs(['--from', '2026-09-01', '--to', '2026-09-28'])).toEqual({
            from: '2026-09-01',
            to: '2026-09-28',
            humanVisits: undefined,
            aiReferrals: {},
        });
    });

    it('rejects missing or malformed dates with the usage line', () => {
        expect(() => parseReportArgs(['--from', '2026-09-01'])).toThrow(/usage: npm run traffic-report/);
        expect(() => parseReportArgs(['--from', '01/09/2026', '--to', '2026-09-28'])).toThrow(/usage/);
    });

    it('rejects a range that ends before it starts', () => {
        expect(() => parseReportArgs(['--from', '2026-09-28', '--to', '2026-09-01'])).toThrow(/is after/);
    });

    it('rejects a non-integer human count and a malformed referral pair', () => {
        const range = ['--from', '2026-09-01', '--to', '2026-09-28'];
        expect(() => parseReportArgs([...range, '--human', 'many'])).toThrow(/--human/);
        expect(() => parseReportArgs([...range, '--ai-referrals', 'chatgpt.com'])).toThrow(/source=count/);
    });
});

describe('parseReportRows', () => {
    it('turns GA4 rows into counts', () => {
        const response = {
            rows: [
                { dimensionValues: [{ value: 'GPTBot' }], metricValues: [{ value: '120' }] },
                { dimensionValues: [{ value: 'ClaudeBot' }], metricValues: [{ value: '45' }] },
            ],
        };
        expect(parseReportRows(response)).toEqual([
            { key: 'GPTBot', count: 120 },
            { key: 'ClaudeBot', count: 45 },
        ]);
    });

    it('treats a response without rows as an empty result', () => {
        expect(parseReportRows({})).toEqual([]);
        expect(parseReportRows({ rows: null })).toEqual([]);
    });

    it('rejects a response of the wrong shape', () => {
        expect(() => parseReportRows({ rows: [{ dimensionValues: [] }] })).toThrow();
    });
});

describe('formatTrafficReport', () => {
    const options = { from: '2026-09-01', to: '2026-09-28', humanVisits: 412, aiReferrals: { 'chatgpt.com': 3 } };

    it('prints humans, referrals, crawler totals and top paths', () => {
        const report = formatTrafficReport(
            options,
            [
                { key: 'GPTBot', count: 120 },
                { key: 'ClaudeBot', count: 45 },
            ],
            [{ key: '/llms.txt', count: 80 }]
        );

        expect(report).toContain('# Traffic report 2026-09-01 → 2026-09-28');
        expect(report).toContain('- Visitors: 412');
        expect(report).toContain('| chatgpt.com | 3 |');
        expect(report).toContain('— 165 requests');
        expect(report).toContain('| GPTBot | 120 |');
        expect(report).toContain('| /llms.txt | 80 |');
    });

    it('says what is missing instead of printing empty tables', () => {
        const report = formatTrafficReport({ from: '2026-09-01', to: '2026-09-28', aiReferrals: {} }, [], []);

        expect(report).toContain('not provided (pass --human)');
        expect(report).toContain('not provided (pass --ai-referrals)');
        expect(report).toContain('no crawler hits recorded');
        expect(report).toContain('— 0 requests');
    });
});
