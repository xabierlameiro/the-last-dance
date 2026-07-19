import fs from 'fs';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const query = jest.fn();
const getSearchConsoleClient = jest.fn();

jest.mock('@/helpers/searchConsole', () => ({
    getSearchConsoleClient: () => getSearchConsoleClient(),
    SITE_URL: 'https://xabierlameiro.com/',
}));

import handler from '../../pages/api/indexed-pages';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset><url><loc>https://a</loc></url><url><loc>https://b</loc></url><url><loc>https://c</loc></url></urlset>`;

describe('/api/indexed-pages', () => {
    beforeEach(() => {
        query.mockReset();
        getSearchConsoleClient.mockReset();
        jest.restoreAllMocks();
    });

    it('reports the row count Search Console returns', async () => {
        query.mockResolvedValue({ data: { rows: [{}, {}, {}, {}, {}] } });
        getSearchConsoleClient.mockReturnValue({ searchanalytics: { query } });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ num: 5 });
    });

    // Without credentials the client is null; counting our own sitemap beats inventing a number
    it('falls back to the sitemap when Search Console is unavailable', async () => {
        getSearchConsoleClient.mockReturnValue(null);
        jest.spyOn(fs, 'readFileSync').mockReturnValue(SITEMAP);
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ num: 3 });
    });

    it('falls back to the sitemap when the Search Console query throws', async () => {
        getSearchConsoleClient.mockReturnValue({ searchanalytics: { query } });
        query.mockRejectedValue(new Error('quota exceeded'));
        jest.spyOn(fs, 'readFileSync').mockReturnValue(SITEMAP);
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ num: 3 });
    });

    it('errors when neither source can produce a count', async () => {
        getSearchConsoleClient.mockReturnValue(null);
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('sitemap.xml missing');
        });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unable to count indexed pages' });
    });
});
