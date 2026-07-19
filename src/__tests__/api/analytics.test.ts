const runReport = jest.fn();

jest.mock('@google-analytics/data', () => ({
    BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({ runReport })),
}));

import handler from '../../pages/api/analytics';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const rowsWith = (pageViews: string, newUsers: string) => [
    { rows: [{ metricValues: [{ value: pageViews }, { value: newUsers }] }] },
];

describe('/api/analytics', () => {
    beforeAll(() => {
        process.env.ANALYTICS_CLIENT_EMAIL = 'test@example.com';
        process.env.ANALYTICS_PRIVATE_KEY = 'key';
        process.env.ANALYTICS_PROJECT_ID = 'project';
    });

    beforeEach(() => {
        runReport.mockReset();
    });

    it('returns site-wide totals when no slug is given', async () => {
        runReport.mockResolvedValue(rowsWith('120', '45'));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(runReport.mock.calls[0][0]).not.toHaveProperty('dimensionFilter');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ pageViews: '120', newUsers: '45' });
    });

    it('filters the report by page path when a slug is given', async () => {
        runReport.mockResolvedValue(rowsWith('7', '3'));
        const res = createMockResponse();

        await handler(createRequest({ slug: '/blog/react/hooks' }), res);

        expect(runReport.mock.calls[0][0].dimensionFilter).toEqual({
            filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'EXACT', value: '/blog/react/hooks' },
            },
        });
        expect(res.json).toHaveBeenCalledWith({ pageViews: '7', newUsers: '3' });
    });

    // Regression: a page with no views made GA return no rows, which used to surface
    // as a 500 and left the UI showing an error instead of a zero count.
    it('returns zeroed counters when a page has no views yet', async () => {
        runReport.mockResolvedValue([{ rows: [] }]);
        const res = createMockResponse();

        await handler(createRequest({ slug: '/blog/react/brand-new-post' }), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ pageViews: 0, newUsers: 0 });
    });

    it('still reports an error when the site-wide report comes back empty', async () => {
        runReport.mockResolvedValue([{ rows: [] }]);
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'No data' });
    });

    it('rejects slugs that attempt directory traversal', async () => {
        const res = createMockResponse();

        await handler(createRequest({ slug: '../../etc/passwd' }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(runReport).not.toHaveBeenCalled();
    });

    it('rejects non-GET requests', async () => {
        const res = createMockResponse();

        await handler(createRequest({}, 'POST'), res);

        expect(res.status).toHaveBeenCalledWith(405);
    });

    it('returns a generic error when the analytics client throws', async () => {
        runReport.mockRejectedValue(new Error('quota exceeded'));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});
