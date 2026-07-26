import allowCors from '../cors';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

/**
 * SDD-L02 / SDD-L10-T11. This helper wraps all eight API routes and had no dedicated test at all —
 * grep for `allowCors` or `Access-Control` across the suite returned nothing. Its wildcard branch
 * fires on `NODE_ENV !== 'production'`, so a misconfigured build would open every endpoint with
 * nothing to catch it.
 */
describe('allowCors', () => {
    const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
    const ORIGINAL_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

    const setNodeEnv = (value: string) => {
        // NODE_ENV is readonly in the Next types; the test needs to drive both branches.
        Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true });
    };

    afterEach(() => {
        setNodeEnv(ORIGINAL_NODE_ENV as string);
        process.env.NEXT_PUBLIC_DOMAIN = ORIGINAL_DOMAIN;
    });

    const handler = jest.fn(async (_req, res) => res.status(200).json({ ok: true }));

    beforeEach(() => handler.mockClear());

    it('reflects an allowlisted origin in production', async () => {
        setNodeEnv('production');
        process.env.NEXT_PUBLIC_DOMAIN = 'https://xabierlameiro.com';
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://xabierlameiro.com' }), res);

        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://xabierlameiro.com');
    });

    // The common CORS bug is a suffix or regex match letting evil-xabierlameiro.com through. The
    // allowlist uses exact membership, and this pins that.
    it('does not reflect a look-alike origin in production', async () => {
        setNodeEnv('production');
        process.env.NEXT_PUBLIC_DOMAIN = 'https://xabierlameiro.com';
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://evil-xabierlameiro.com' }), res);

        const origins = res.setHeader.mock.calls.filter(([key]) => key === 'Access-Control-Allow-Origin');
        expect(origins).toHaveLength(0);
    });

    // The wildcard must be reachable only outside production. Vercel preview builds run with
    // NODE_ENV=production, so previews get the strict allowlist too.
    it('never falls back to a wildcard in production', async () => {
        setNodeEnv('production');
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://somewhere.example' }), res);

        expect(res.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    it('allows a wildcard outside production', async () => {
        setNodeEnv('development');
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://somewhere.example' }), res);

        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    // Every route now sets `public, s-maxage=...`. Without Vary a CDN can serve one origin's
    // Access-Control-Allow-Origin to a request from another.
    it('always sets Vary: Origin, because the responses are cacheable', async () => {
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://xabierlameiro.com' }), res);

        expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
    });

    it('restricts methods to GET and OPTIONS', async () => {
        const res = createMockResponse();

        await allowCors(handler)(createRequest(), res);

        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET,OPTIONS');
    });

    it('short-circuits a preflight without invoking the handler', async () => {
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'OPTIONS'), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(handler).not.toHaveBeenCalled();
    });

    it('never sets Access-Control-Allow-Credentials', async () => {
        const res = createMockResponse();

        await allowCors(handler)(createRequest({}, 'GET', { origin: 'https://xabierlameiro.com' }), res);

        const names = res.setHeader.mock.calls.map(([key]: [string]) => key);
        expect(names).not.toContain('Access-Control-Allow-Credentials');
    });
});
