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

    it('sets a long cache header, so a visitor does not spend a token-quota request', async () => {
        reposGet.mockResolvedValue({ data: { stargazers_count: 42 } });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', expect.stringContaining('s-maxage='));
    });

    // SDD-L02 regression test. This route used to forward Octokit's raw message, which under rate
    // limiting reads "API rate limit exceeded for user ID 12345" — the owner's numeric account id —
    // and on a revoked token reads "Bad credentials", a live oracle for when the PAT broke. The
    // upstream detail must never reach the client.
    it('does not leak the upstream GitHub error message', async () => {
        reposGet.mockRejectedValue({ status: 403, message: 'API rate limit exceeded for user ID 12345.' });
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Internal server error' });

        const body = JSON.stringify(res.json.mock.calls);
        expect(body).not.toContain('12345');
        expect(body).not.toContain('rate limit');
    });

    it('returns the same generic payload for a non-GitHub error shape', async () => {
        reposGet.mockRejectedValue('network down');
        const res = createMockResponse();

        await handler(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Internal server error' });
    });
});
