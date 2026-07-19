import fetchMock from 'jest-fetch-mock';
import handler from '../../pages/api/heating';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const loginResponse = (cookie: string | null) =>
    [
        '',
        { status: 200, headers: cookie ? { 'set-cookie': cookie } : {} },
    ] as [string, { status: number; headers: Record<string, string> }];

const VALID_COOKIE = 'ar.loggedUser=tok123; path=/, .AspNet.ApplicationCookie=app456; path=/';

const plantData = (items: Array<{ id: string; value: number }>) => JSON.stringify({ data: { items } });

describe('/api/heating', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        fetchMock.resetMocks();
        process.env.HEATING_CREDENTIALS = '{"usr":"a","pwd":"b"}';
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
