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

type DeploymentResponseType = DeploymentResponse | { error: string };

/**
 * @description Get the last deployment status
 * @param _request NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<DeploymentResponse>}
 * @example localhost:3000/api/deployments
 */
const REQUIRED_ENV = ['NEXT_PROJECT_ID', 'NEXT_TOKEN', 'NEXT_PUBLIC_ENV'] as const;

const fetchLatestDeployment = async (projectId: string, target: string, token: string) => {
    const url = new URL('https://api.vercel.com/v6/deployments');
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('target', target);
    url.searchParams.set('limit', '1');

    const result = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        method: 'get',
    });

    const data = await result.json();
    return data.deployments?.[0];
};

export default allowCors(async function handler(
    _request: NextApiRequest,
    res: NextApiResponse<DeploymentResponseType>
) {
    const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
    if (missingEnv.length > 0) {
        console.error(`Missing required environment variables for Vercel API: ${missingEnv.join(', ')}`);
        return res.status(500).json({ error: 'Configuration error' });
    }

    try {
        const deployment = await fetchLatestDeployment(
            process.env.NEXT_PROJECT_ID as string,
            process.env.NEXT_PUBLIC_ENV as string,
            process.env.NEXT_TOKEN as string
        );

        if (!deployment) {
            throw new Error('No deployment found');
        }

        return res.status(200).json({
            status: deployment.state,
            environment: process.env.NEXT_PUBLIC_ENV as DeploymentEnvironment,
            createdAt: deployment.createdAt,
            buildingAt: deployment.buildingAt,
            ready: deployment.ready,
            username: deployment.creator?.username,
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        return res.status(500).json({ error: errorMessage });
    }
});
