import fetchMock from 'jest-fetch-mock';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const loginResponse = (cookie: string | null) =>
    ['', { status: 200, headers: cookie ? { 'set-cookie': cookie } : {} }] as [
        string,
        { status: number; headers: Record<string, string> },
    ];

const VALID_COOKIE = 'ar.loggedUser=tok123; path=/, .AspNet.ApplicationCookie=app456; path=/';

const plantData = (items: Array<{ id: string; value: number }>) => JSON.stringify({ data: { items } });

type Handler = (typeof import('../../pages/api/heating'))['default'];

describe('/api/heating', () => {
    const originalEnv = { ...process.env };
    let handler: Handler;

    // SDD-L02 put a module-scoped session cache in this route, which would otherwise leak between
    // tests and make them order-dependent — the second test would silently reuse the first test's
    // cookies. Re-importing per test gives each one a cold cache.
    beforeEach(async () => {
        fetchMock.resetMocks();
        process.env.HEATING_CREDENTIALS = '{"usr":"a","pwd":"b"}';
        jest.resetModules();
        handler = (await import('../../pages/api/heating')).default;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns the outside and zone temperatures', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(
            plantData([
                { id: 'OutsideTemp', value: 11.5 },
                { id: 'ZoneMeasuredTemp', value: 21.2 },
            ])
        );
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ outsideTemp: 11.5, zoneMeasuredTemp: 21.2 });
    });

    // The finding this phase exists for. Before SDD-L02 every anonymous GET POSTed the owner's real
    // Ariston credentials to the vendor's login endpoint, so a curl loop drove thousands of login
    // attempts at that account and could lock the owner out of their own heating. Two requests must
    // cost one login.
    it('reuses the session instead of re-authenticating on every request', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(plantData([{ id: 'OutsideTemp', value: 9 }]));
        fetchMock.mockResponseOnce(plantData([{ id: 'OutsideTemp', value: 9 }]));

        await handler(createRequest(), createMockResponse());
        await handler(createRequest(), createMockResponse());

        const loginCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/Account/Login'));
        expect(loginCalls).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    // A cookie can be revoked upstream before its TTL expires. That must cost one extra login, not a
    // broken widget until the TTL runs out.
    it('re-authenticates once when a cached session has gone stale', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(plantData([{ id: 'OutsideTemp', value: 9 }]));
        await handler(createRequest(), createMockResponse());

        // Second request: the cached read fails, then a fresh login and read succeed.
        fetchMock.mockResponseOnce(JSON.stringify({ data: {} }));
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(plantData([{ id: 'OutsideTemp', value: 12 }]));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ outsideTemp: 12, zoneMeasuredTemp: 0 });
        const loginCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/Account/Login'));
        expect(loginCalls).toHaveLength(2);
    });

    it('sets a cache header so the edge absorbs repeat traffic', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(plantData([{ id: 'OutsideTemp', value: 9 }]));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', expect.stringContaining('s-maxage='));
    });

    it('never caches an error response', async () => {
        fetchMock.mockResponseOnce(...loginResponse(null));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    });

    // Ariston answers 200 with no session cookies when the credentials are rejected
    it('errors when the login response carries no session cookies', async () => {
        fetchMock.mockResponseOnce(...loginResponse(null));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('defaults missing temperature readings to zero', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(plantData([{ id: 'SomethingElse', value: 3 }]));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.json).toHaveBeenCalledWith({ outsideTemp: 0, zoneMeasuredTemp: 0 });
    });

    it('errors when the plant response has no items', async () => {
        fetchMock.mockResponseOnce(...loginResponse(VALID_COOKIE));
        fetchMock.mockResponseOnce(JSON.stringify({ data: {} }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('reports a configuration error when credentials are missing', async () => {
        delete process.env.HEATING_CREDENTIALS;
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Configuration error' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // Regression guard: a NEXT_PUBLIC_HEATING fallback used to back up HEATING_CREDENTIALS.
    // Next inlines every NEXT_PUBLIC_* value into the client bundle, so honouring it would
    // publish the Ariston login payload to every visitor. The route must ignore it.
    it('never falls back to a NEXT_PUBLIC_ variable for credentials', async () => {
        delete process.env.HEATING_CREDENTIALS;
        process.env.NEXT_PUBLIC_HEATING = '{"usr":"leaked","pwd":"leaked"}';
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Configuration error' });
        expect(fetchMock).not.toHaveBeenCalled();

        delete process.env.NEXT_PUBLIC_HEATING;
    });
});
