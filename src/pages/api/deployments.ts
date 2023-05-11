import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @description Get the last deployment status
 * @param _request NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<{ status: string; enviroment: string; } | { error: string; }>}
 * @example localhost:3000/api/deployments
 */
export default async function handler(_request: NextApiRequest, res: NextApiResponse<{}>) {
    try {
        const result = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${process.env.NEXT_PROJECT_ID}&teamId=${process.env.NEXT_TEAM_ID}&target=${process.env.NEXT_ENV}&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_TOKEN}`,
                },
                method: 'get',
            }
        );

        const data = await result.json();

        res.status(200).json({
            status: data.deployments[0]['state'],
            enviroment: process.env.NEXT_ENV,
        });
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
}
