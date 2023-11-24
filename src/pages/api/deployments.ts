import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';

export type DeploymentStatus = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
export type Deploymentenvironment = 'production' | 'preview';

export type DeploymentResponse = {
    status: DeploymentStatus;
    environment: Deploymentenvironment;
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
    try {
        const result = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${process.env.NEXT_PROJECT_ID}&teamId=${process.env.NEXT_TEAM_ID}&target=${process.env.NEXT_PUBLIC_ENV}&limit=1`,
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
            environment: process.env.NEXT_PUBLIC_ENV as 'production' | 'preview',
            createdAt: data.deployments[0]['createdAt'],
            buildingAt: data.deployments[0]['buildingAt'],
            ready: data.deployments[0]['ready'],
            username: data.deployments[0]['creator']['username'],
        });
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
});
