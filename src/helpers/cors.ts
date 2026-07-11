import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const allowCors =
  <T extends NextApiHandler>(fn: T) => async (req: NextApiRequest, res: NextApiResponse) => {
    // Only allow specific origins in production
    const allowedOrigins = process.env.NODE_ENV === 'production'
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

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return await fn(req, res);
  };

export default allowCors;
