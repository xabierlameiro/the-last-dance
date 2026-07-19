const reposGet = jest.fn();

// The route builds its Octokit at module scope, so the mock is constructed while
// `reposGet` is still in its temporal dead zone. The arrow defers the lookup to call time.
jest.mock('octokit', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        rest: { repos: { get: (...args: unknown[]) => reposGet(...args) } },
    })),
}));

import handler from '../../pages/api/github-stars';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

describe('/api/github-stars', () => {
    beforeEach(() => {
        reposGet.mockReset();
    });

    it('returns the raw stargazer count', async () => {
        reposGet.mockResolvedValue({ data: { stargazers_count: 42 } });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(reposGet).toHaveBeenCalledWith({ owner: 'xabierlameiro', repo: 'the-last-dance' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(42);
    });

    it('forwards the status and message of a GitHub API error', async () => {
        reposGet.mockRejectedValue({ status: 404, message: 'Not Found' });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ statusCode: 404, message: 'Not Found' });
    });

    // A thrown string or a plain Error has no status/message pair to forward
    it('falls back to a generic payload for a non-GitHub error shape', async () => {
        reposGet.mockRejectedValue('network down');
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Unknown error' });
    });
});
