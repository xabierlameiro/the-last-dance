import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shared fixtures for the API route tests.
 *
 * Lives outside `__tests__` on purpose: jest's default testMatch treats every file
 * under that directory as a suite, and a helper module with no tests fails the run.
 */

export type MockResponse = NextApiResponse & {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
    end: jest.Mock;
};

export const createMockResponse = (): MockResponse => {
    const res = {} as MockResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
};

/**
 * `headers` is always present because the CORS wrapper reads `req.headers.origin`
 * before the handler runs; omitting it throws before the assertion under test.
 */
export const createRequest = (
    query: Record<string, string> = {},
    method = 'GET'
): NextApiRequest => ({ method, query, headers: {} } as unknown as NextApiRequest);
