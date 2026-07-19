import fetchMock from 'jest-fetch-mock';
import handler from '../../pages/api/news';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const createGetRequest = (city: string) => createRequest({ city });

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Search</title>
<item>
  <title>Limerick headline</title>
  <link>https://example.com/a</link>
  <pubDate>Thu, 16 Jul 2026 10:00:00 GMT</pubDate>
  <description>&lt;a href="https://example.com/a"&gt;Limerick headline&lt;/a&gt;</description>
  <source url="https://outlet.example">Outlet</source>
</item>
<item>
  <title></title>
  <link></link>
</item>
</channel></rss>`;

describe('/api/news', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    // Regression for SDD-001: the UI sends "city+region" and the old validation rejected '+'
    it('accepts "city+region" values and parses the Google News RSS feed', async () => {
        fetchMock.mockResponseOnce(RSS_FIXTURE);
        const res = createMockResponse();

        await handler(createGetRequest('limerick+ireland'), res);

        expect(fetchMock.mock.calls[0][0]).toContain('news.google.com/rss/search');
        // '+' in the input becomes a space in the query ("limerick ireland"), URL-encoded as '+'
        expect(fetchMock.mock.calls[0][0]).toContain('q=limerick+ireland');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            city: 'limerick+ireland',
            news: [
                {
                    title: 'Limerick headline',
                    description: 'Outlet',
                    link: 'https://example.com/a',
                    published: '2026-07-16',
                },
            ],
        });
    });

    it('returns an empty list when the feed has no items', async () => {
        fetchMock.mockResponseOnce('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>');
        const res = createMockResponse();

        await handler(createGetRequest('limerick'), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ city: 'limerick', news: [] });
    });

    it('rejects invalid city values', async () => {
        const res = createMockResponse();

        await handler(createGetRequest('<script>'), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
