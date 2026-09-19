import { NextRequest, type NextFetchEvent } from 'next/server';

const GPTBOT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';
const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const createEvent = () => {
    const pending: Promise<unknown>[] = [];
    const event = { waitUntil: jest.fn((promise: Promise<unknown>) => pending.push(promise)) };
    return { event: event as unknown as NextFetchEvent, waitUntil: event.waitUntil, pending };
};

const request = (path: string, userAgent: string) =>
    new NextRequest(`https://xabierlameiro.com${path}`, { headers: { 'user-agent': userAgent } });

// The module keeps a once-per-isolate warning flag, so each test loads a fresh copy.
const loadMiddleware = async () => {
    jest.resetModules();
    return (await import('../middleware')).middleware;
};

describe('middleware', () => {
    const ORIGINAL_ENV = { ...process.env };
    let fetchSpy: jest.SpyInstance;
    let warn: jest.SpyInstance;

    beforeEach(() => {
        process.env.GA_CRAWLER_MEASUREMENT_ID = 'G-TEST123';
        process.env.GA_CRAWLER_API_SECRET = 'secret';
        fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
        warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
        fetchSpy.mockRestore();
        warn.mockRestore();
    });

    it('lets a browser through without sending anything', async () => {
        const middleware = await loadMiddleware();
        const { event, waitUntil } = createEvent();

        const response = middleware(request('/blog/nextjs/nextjs-memory-leak-in-production', CHROME), event);

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(waitUntil).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('records a crawler hit after the response, with bot and path', async () => {
        const middleware = await loadMiddleware();
        const { event, pending } = createEvent();

        const response = middleware(request('/llms.txt', GPTBOT), event);
        await Promise.all(pending);

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
        expect(body.events[0].params).toMatchObject({ bot: 'GPTBot', purpose: 'training', path: '/llms.txt' });
    });

    it('serves the crawler normally when GA4 is unreachable', async () => {
        fetchSpy.mockRejectedValue(new Error('network down'));
        const middleware = await loadMiddleware();
        const { event, pending } = createEvent();

        const response = middleware(request('/', GPTBOT), event);

        await expect(Promise.all(pending)).resolves.toEqual([false]);
        expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('skips sending and warns once when the stream is not configured', async () => {
        delete process.env.GA_CRAWLER_MEASUREMENT_ID;
        const middleware = await loadMiddleware();
        const { event, waitUntil } = createEvent();

        middleware(request('/', GPTBOT), event);
        middleware(request('/about', GPTBOT), event);

        expect(waitUntil).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('excludes API routes, Next internals and static assets from the matcher', async () => {
        jest.resetModules();
        const { config } = await import('../middleware');
        const matcher = new RegExp(`^${config.matcher[0]}$`);

        ['/', '/about', '/es/blog', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/feed.xml'].forEach(
            (path) => expect(matcher.test(path)).toBe(true)
        );
        ['/api/analytics', '/_next/static/chunks/main.js', '/posts/nextjs-memory-leak.png', '/favicon.ico'].forEach(
            (path) => expect(matcher.test(path)).toBe(false)
        );
    });

    it('serves a post browsed from a tag from the tag render, keeping the query', async () => {
        const middleware = await loadMiddleware();
        const { event } = createEvent();

        const response = middleware(request('/blog/error/solve-address-in-use-error?tag=node', CHROME), event);

        const rewrite = new URL(String(response.headers.get('x-middleware-rewrite')));
        expect(rewrite.pathname).toBe('/blog/node/solve-address-in-use-error');
        expect(rewrite.searchParams.get('tag')).toBe('node');
    });

    it('does not rewrite a post without a valid tag', async () => {
        const middleware = await loadMiddleware();
        const { event } = createEvent();

        ['/blog/error/solve-address-in-use-error', '/blog/error/solve-address-in-use-error?tag=Node'].forEach((path) => {
            const response = middleware(request(path, CHROME), event);
            expect(response.headers.get('x-middleware-rewrite')).toBeNull();
            expect(response.headers.get('x-middleware-next')).toBe('1');
        });
    });

    it('rewrites and records a crawler that follows a tag link', async () => {
        const middleware = await loadMiddleware();
        const { event, pending } = createEvent();

        const response = middleware(request('/blog/error/solve-address-in-use-error?tag=node', GPTBOT), event);
        await Promise.all(pending);

        expect(new URL(String(response.headers.get('x-middleware-rewrite'))).pathname).toBe(
            '/blog/node/solve-address-in-use-error'
        );
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('matches the data request of a client-side navigation, as Next compiles the matcher', async () => {
        // The raw-regex check above cannot see this: Next prefixes every matcher with an optional
        // `/_next/data/<build>` and a `.json` suffix, and an excluded `.json` extension in the pattern
        // silently kept every data request away from the middleware. Compiled by Next itself so an
        // upgrade that changes the compilation shows up here.
        jest.resetModules();
        const { config } = await import('../middleware');
        const { getMiddlewareMatchers } = await import('next/dist/build/analysis/get-page-static-info');
        const [compiled] = getMiddlewareMatchers(config.matcher, {
            i18n: { locales: ['en', 'es', 'gl'], defaultLocale: 'en' },
        } as Parameters<typeof getMiddlewareMatchers>[1]);
        const matcher = new RegExp(compiled.regexp);

        expect(matcher.test('/en/blog/error/solve-address-in-use-error')).toBe(true);
        expect(matcher.test('/_next/data/BUILD/en/blog/error/solve-address-in-use-error.json')).toBe(true);
        expect(matcher.test('/_next/data/BUILD/es/blog/error/resolver-direccion-en-uso-error.json')).toBe(true);
    });
});
