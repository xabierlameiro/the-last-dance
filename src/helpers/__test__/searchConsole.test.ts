import { getSearchConsoleClient, SITE_URL } from '../searchConsole';

/**
 * SDD-L10-T14. 0/9 statements before this.
 *
 * The branch that matters is the null return: `/api/indexed-pages` calls this and falls back to
 * counting the sitemap when it gets `null`, so a deploy missing the analytics credentials degrades
 * to a slightly stale number instead of a 500. That graceful path is the whole reason the function
 * returns `null` rather than throwing, and nothing exercised it.
 */
describe('getSearchConsoleClient', () => {
    const ORIGINAL_EMAIL = process.env.ANALYTICS_CLIENT_EMAIL;
    const ORIGINAL_KEY = process.env.ANALYTICS_PRIVATE_KEY;

    afterEach(() => {
        process.env.ANALYTICS_CLIENT_EMAIL = ORIGINAL_EMAIL;
        process.env.ANALYTICS_PRIVATE_KEY = ORIGINAL_KEY;
    });

    it('should target the domain property', () => {
        // A `sc-domain:` property covers every subdomain and protocol; a URL-prefix property would
        // silently report on only one of them.
        expect(SITE_URL).toBe('sc-domain:xabierlameiro.com');
    });

    it('should return null when the service account email is missing', () => {
        delete process.env.ANALYTICS_CLIENT_EMAIL;
        process.env.ANALYTICS_PRIVATE_KEY = 'key';

        expect(getSearchConsoleClient()).toBeNull();
    });

    it('should return null when the private key is missing', () => {
        process.env.ANALYTICS_CLIENT_EMAIL = 'test@example.com';
        delete process.env.ANALYTICS_PRIVATE_KEY;

        expect(getSearchConsoleClient()).toBeNull();
    });

    it('should build a client when both credentials are present', () => {
        process.env.ANALYTICS_CLIENT_EMAIL = 'test@example.com';
        process.env.ANALYTICS_PRIVATE_KEY = 'key';

        const client = getSearchConsoleClient();

        expect(client).not.toBeNull();
        expect(client?.searchanalytics).toBeDefined();
    });
});
