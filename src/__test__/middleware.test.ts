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
});
