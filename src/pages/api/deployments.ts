import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';
import { CACHE, fetchWithTimeout } from '@/helpers/http';
import { deploymentStatusSchema, describeIssues } from '../../types/schemas';
import { vercelDeploymentsSchema } from '../../types/upstream';
import type { DeploymentData, DeploymentEnvironment } from '../../types/api';

/**
 * SDD-L07: `DeploymentStatus`, `DeploymentEnvironment` and this response shape were declared here
 * AND in `types/api.ts`, with the same names and no import between them. Two declarations of one
 * contract drift the moment either side is edited, and this pair had already drifted from the
 * upstream API they describe: the status union listed six states where Vercel documents eight, and
 * `DeploymentStatus` renders `styles[status.toLowerCase()]`, so `BLOCKED` or `DELETED` produced an
 * unstyled dot with no fallback.
 *
 * The local copies are gone. `types/api.ts` re-exports the inferred types, so the old import path
 * still resolves for anything outside this file.
 */
export type { DeploymentStatus, DeploymentEnvironment, DeploymentData as DeploymentResponse } from '../../types/api';

type DeploymentResponseType = DeploymentData | { error: string };

/**
 * @description Convert a Vercel unix-millisecond timestamp into the ISO string the contract declares.
 *
 * The route used to forward these three fields untouched under a `string` annotation while Vercel
 * documents all of them as `number`. `new Date()` accepts either, so `DeploymentStatus`'s tooltip
 * kept working and the mismatch stayed invisible — a type that is wrong but never observed. Sending
 * an ISO string makes the declaration true rather than lucky, and it is what a tooltip wants anyway.
 */
const toIsoString = (timestamp: number | undefined): string =>
    typeof timestamp === 'number' ? new Date(timestamp).toISOString() : '';

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

    // Was missing entirely: on a 401 from a rotated token, or a 429, Vercel answers a JSON error
    // envelope with no `deployments` key. `data.deployments?.[0]` then quietly produced `undefined`
    // and the handler reported "No deployment found" — the same message as a project that has never
    // deployed. Two very different situations, one indistinguishable log line.
    if (!result.ok) {
        throw new Error(`Vercel API responded ${result.status}`);
    }

    const parsed = vercelDeploymentsSchema.safeParse(await result.json());
    if (!parsed.success) {
        throw new Error(`Vercel API response did not match: ${describeIssues(parsed.error.issues)}`);
    }

    return parsed.data.deployments?.[0];
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

        // `state` is optional upstream and `readyState` is the required one, so fall back rather
        // than trust it. Validating against the union here is what keeps the widget's
        // `styles[status.toLowerCase()]` lookup from silently missing: a state Vercel adds later
        // fails loudly at this line instead of rendering an invisible dot.
        const state = deploymentStatusSchema.safeParse(deployment.state ?? deployment.readyState);
        if (!state.success) {
            throw new Error(`Unknown Vercel deployment state: ${String(deployment.state ?? deployment.readyState)}`);
        }

        res.setHeader('Cache-Control', CACHE.deployment);
        return res.status(200).json({
            status: state.data,
            environment: process.env.NEXT_PUBLIC_ENV as DeploymentEnvironment,
            createdAt: toIsoString(deployment.createdAt),
            buildingAt: toIsoString(deployment.buildingAt),
            ready: toIsoString(deployment.ready),
            // Kept deliberately. The audit flagged it as reconnaissance, but DeploymentStatus renders
            // it in the widget tooltip, and the value is the owner's own account name — already public
            // as the org in this repository's URL. Removing it would break a feature to hide
            // something that is not hidden.
            // `creator.username` is optional upstream — only `creator.uid` is required — so the
            // contract's `username: string` needed a value for the case where Vercel omits it.
            username: deployment.creator?.username ?? '',
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
