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
        expect(res.json).toHaveBeenCalledWith({
            status: 'READY',
            environment: 'production',
            createdAt: DEPLOYMENT.createdAt,
            buildingAt: DEPLOYMENT.buildingAt,
            ready: DEPLOYMENT.ready,
            username: 'xabierlameiro',
        });
    });

    it('reports a configuration error when a required variable is missing', async () => {
        delete process.env.NEXT_TOKEN;
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Configuration error' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('errors when Vercel returns an empty deployment list', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'No deployment found' });
    });

    // The deployment may not carry a creator, so username must degrade rather than throw
    it('tolerates a deployment with no creator', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ deployments: [{ ...DEPLOYMENT, creator: undefined }] }));
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: undefined }));
    });
});
