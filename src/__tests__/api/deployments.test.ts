import fetchMock from 'jest-fetch-mock';
import handler from '../../pages/api/deployments';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const DEPLOYMENT = {
    state: 'READY',
    createdAt: 1752800000000,
    buildingAt: 1752800010000,
    ready: 1752800060000,
    creator: { username: 'xabierlameiro' },
};

describe('/api/deployments', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        fetchMock.resetMocks();
        process.env.NEXT_PROJECT_ID = 'prj_123';
        process.env.NEXT_TOKEN = 'token';
        process.env.NEXT_PUBLIC_ENV = 'production';
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns the latest deployment for the configured target', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [DEPLOYMENT] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toContain('projectId=prj_123');
        expect(url).toContain('target=production');
        expect(url).toContain('limit=1');
        expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer token');

        expect(res.status).toHaveBeenCalledWith(200);
        // SDD-L07: the three timestamps are ISO strings now. Vercel documents them as unix
        // milliseconds and the route forwarded them untouched under a `createdAt: string`
        // annotation — a contract that was simply false, and invisible because `new Date()` takes
        // either. This fixture's numbers are what made that visible.
        expect(res.json).toHaveBeenCalledWith({
            status: 'READY',
            environment: 'production',
            createdAt: new Date(DEPLOYMENT.createdAt).toISOString(),
            buildingAt: new Date(DEPLOYMENT.buildingAt).toISOString(),
            ready: new Date(DEPLOYMENT.ready).toISOString(),
            username: 'xabierlameiro',
        });
    });

    // The status union listed six states; Vercel documents eight. `DeploymentStatus` renders
    // `styles[status.toLowerCase()]`, so BLOCKED or DELETED produced an unstyled, invisible dot.
    it('accepts every state Vercel documents, not just the six that were declared', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [{ ...DEPLOYMENT, state: 'BLOCKED' }] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'BLOCKED' }));
    });

    // A state Vercel adds later must fail here rather than reach the widget and render nothing.
    it('rejects a state outside the documented union', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [{ ...DEPLOYMENT, state: 'HIBERNATING' }] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    // Was missing entirely: a 401 from a rotated token produced `undefined` from
    // `data.deployments?.[0]` and was reported as "No deployment found" — the same log line as a
    // project that has never deployed.
    it('fails on a non-2xx from Vercel instead of reading the error envelope', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ error: { code: 'forbidden' } }), { status: 401 });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('reports a configuration error when a required variable is missing', async () => {
        delete process.env.NEXT_TOKEN;
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Configuration error' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // SDD-L02: the internal reason ("No deployment found") is logged, not returned. This was the only
    // route of eight echoing raw Error.message to an anonymous caller — on the error path a non-JSON
    // Vercel response surfaces a SyntaxError carrying a fragment of the upstream body.
    it('errors generically when Vercel returns an empty deployment list', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        expect(JSON.stringify(res.json.mock.calls)).not.toContain('No deployment found');
    });

    // The deployment may not carry a creator — `creator.username` is optional upstream — so username
    // must degrade rather than throw. SDD-L07: it degrades to '' rather than `undefined`, because
    // the contract declares `username: string` and JSON drops undefined fields entirely.
    it('tolerates a deployment with no creator', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [{ ...DEPLOYMENT, creator: undefined }] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: '' }));
    });
});
