import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const allowCors =
    <T extends NextApiHandler>(fn: T) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
        // Only allow specific origins in production
        const allowedOrigins =
            process.env.NODE_ENV === 'production'
                ? [process.env.NEXT_PUBLIC_DOMAIN || 'https://xabierlameiro.com']
                : ['http://localhost:3000', 'https://localhost:3000'];

        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else if (process.env.NODE_ENV !== 'production') {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }

        // Every API route is read-only
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');

        // The allowlist above reflects the request's Origin into the response, and every route now
        // sets a `public, s-maxage=...` Cache-Control (SDD-L02). Without `Vary: Origin` a CDN keys
        // those entries on the URL alone and can serve a response bearing one origin's
        // Access-Control-Allow-Origin to a request from another. Not exploitable while the production
        // allowlist has exactly one entry — every cached value is identical — but it becomes live the
        // moment a second origin is added, which is precisely when nobody would think to look here.
        res.setHeader('Vary', 'Origin');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        return await fn(req, res);
    };

export default allowCors;
