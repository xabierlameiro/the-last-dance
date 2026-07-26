import createFetcher, { ResponseShapeError, ResponseStatusError } from '../createFetcher';
import {
    analyticsSchema,
    counterSchema,
    deploymentSchema,
    githubStarsSchema,
    heatingSchema,
    newsSchema,
    weatherSchema,
    xrpSchema,
} from '../../types/schemas';

/**
 * SDD-L07. The point of the phase in one file.
 *
 * Every one of these boundaries used to end in `return data as X`, which emits no code — so a
 * response that had drifted was accepted silently and surfaced somewhere else entirely, as a
 * mis-rendered counter or a `TypeError` deep in a component. Each case below feeds a boundary the
 * wrong shape and asserts it is rejected *here*, with the offending field named.
 */
const respondWith = (body: unknown, ok = true, status = 200) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok,
        status,
        statusText: ok ? 'OK' : 'Bad Gateway',
        json: () => Promise.resolve(body),
    });
};

describe('createFetcher', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset();
    });

    it('should resolve the parsed value when the response matches', async () => {
        respondWith({ pageViews: 120, newUsers: 45 });

        await expect(createFetcher(analyticsSchema, '/api/analytics')('url')).resolves.toEqual({
            pageViews: 120,
            newUsers: 45,
        });
    });

    it('should strip fields the contract does not declare', async () => {
        respondWith({ num: 61, debugTrace: 'internal' });

        await expect(createFetcher(counterSchema, '/api/indexed-pages')('url')).resolves.toEqual({ num: 61 });
    });

    it('should throw a ResponseStatusError for a non-2xx, without reading the body', async () => {
        respondWith({ error: 'nope' }, false, 502);

        const error = await createFetcher(xrpSchema, '/api/xrp')('url').catch((err) => err);

        expect(error).toBeInstanceOf(ResponseStatusError);
        expect(error.status).toBe(502);
    });

    it('should name the field that broke the contract', async () => {
        // The real defect: GA4 emits metric values as strings.
        respondWith({ pageViews: '12345', newUsers: 45 });

        const error = await createFetcher(analyticsSchema, '/api/analytics')('url').catch((err) => err);

        expect(error).toBeInstanceOf(ResponseShapeError);
        expect(error.message).toContain('/api/analytics');
        expect(error.message).toContain('pageViews');
        expect(error.message).toContain('expected number');
    });

    /**
     * Criterion 2 of the spec: one case per boundary, each fed the shape it would actually receive
     * if its upstream drifted, so none of them can quietly go back to trusting the response.
     */
    describe.each([
        ['/api/analytics', analyticsSchema, { pageViews: '1', newUsers: 2 }],
        ['/api/heating', heatingSchema, { outsideTemp: '12.5', zoneMeasuredTemp: 21 }],
        ['/api/indexed-pages', counterSchema, { num: null }],
        ['/api/news', newsSchema, { news: [{ link: 'x', title: 'y', published: 3, description: 'z' }] }],
        ['/api/xrp', xrpSchema, { price: '0.51', todaySummary: 'Up', todayPorcentage: '+1%' }],
        ['/api/weather', weatherSchema, [{ city: 'moraña' }]],
        ['/api/github-stars', githubStarsSchema, '42'],
        ['/api/deployments', deploymentSchema, { status: 'HIBERNATING' }],
    ])('%s', (label, schema, malformed) => {
        it('should reject a response that no longer matches its contract', async () => {
            respondWith(malformed);

            const error = await createFetcher(schema, label)('url').catch((err) => err);

            expect(error).toBeInstanceOf(ResponseShapeError);
            expect(error.message).toContain(label);
        });
    });

    // A city that geocodes but has no current forecast: the route answers explicit nulls, and the
    // hook's own type used to claim these were always strings.
    it('should accept the nulls /api/weather deliberately sends', async () => {
        respondWith([
            {
                city: 'moraña',
                name: null,
                precipitation: null,
                humidity: null,
                windSpeed: null,
                grades: null,
            },
        ]);

        await expect(createFetcher(weatherSchema, '/api/weather')('url')).resolves.toHaveLength(1);
    });
});
