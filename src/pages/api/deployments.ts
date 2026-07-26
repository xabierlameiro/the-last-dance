import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';
import { CACHE, fetchWithTimeout } from '@/helpers/http';

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

    const result = await fetchWithTimeout(url.toString(), {
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
        res.setHeader('Cache-Control', CACHE.error);
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

        res.setHeader('Cache-Control', CACHE.deployment);
        return res.status(200).json({
            status: deployment.state,
            environment: process.env.NEXT_PUBLIC_ENV as DeploymentEnvironment,
            createdAt: deployment.createdAt,
            buildingAt: deployment.buildingAt,
            ready: deployment.ready,
            // Kept deliberately. The audit flagged it as reconnaissance, but DeploymentStatus renders
            // it in the widget tooltip, and the value is the owner's own account name — already public
            // as the org in this repository's URL. Removing it would break a feature to hide
            // something that is not hidden.
            username: deployment.creator?.username,
        });
    } catch (err: unknown) {
        // Was `err.message`, the only route of eight that echoed internal error text to the client.
        // A non-JSON Vercel error page surfaces a SyntaxError carrying a fragment of the upstream
        // body, and a fetch failure surfaces Node's internal text — an uncontrolled channel from
        // server internals to an anonymous caller.
        console.error('Deployments API Error:', err);
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
