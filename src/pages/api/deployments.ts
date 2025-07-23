import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';

export type DeploymentStatus = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
export type DeploymentEnvironment = 'production' | 'preview';

export type DeploymentResponse = {
    status: DeploymentStatus;
    environment: DeploymentEnvironment;
    createdAt: string;
    buildingAt: string;
    ready: string;
    username: string;
};

export type DeploymentResponseType = DeploymentResponse | { error: string };

/**
 * @description Get the last deployment status
 * @param _request NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<DeploymentResponse>}
 * @example localhost:3000/api/deployments
 */
export default allowCors(async function handler(_request: NextApiRequest, res: NextApiResponse<DeploymentResponseType>) {
    // Validate required environment variables
    if (!process.env.NEXT_PROJECT_ID || !process.env.NEXT_TOKEN || !process.env.NEXT_PUBLIC_ENV) {
        console.error('Missing required environment variables for Vercel API');
        return res.status(500).json({ error: 'Configuration error' });
    }

    try {
        const result = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${process.env.NEXT_PROJECT_ID}&target=${process.env.NEXT_PUBLIC_ENV}&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_TOKEN}`,
                },
                method: 'get',
            }
        );

        const data = await result.json();
        const deployment = data.deployments?.[0];

        if (!deployment) {
            throw new Error('No deployment found');
        }

        res.status(200).json({
            status: deployment.state,
            environment: process.env.NEXT_PUBLIC_ENV as 'production' | 'preview',
            createdAt: deployment.createdAt,
            buildingAt: deployment.buildingAt,
            ready: deployment.ready,
            username: deployment.creator?.username,
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ error: errorMessage });
    }
});
