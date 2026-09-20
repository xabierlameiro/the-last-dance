import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';
import allowCors from '../../helpers/cors';
import { CACHE } from '@/helpers/http';
import type { GithubStarsData } from '../../types/schemas';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const REPOSITORY = {
    owner: 'xabierlameiro',
    repo: 'the-last-dance',
};

/**
 * @description This function is used to get the total number of stars for a given repository. It uses the GitHub REST
 * API to get the data.
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {Promise<{
 *     error?: string;
 *     total?: number;
 * }>}
 */
type GitHubStarsResponse = GithubStarsData | { statusCode: number; message: string };

export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse<GitHubStarsResponse>) {
    try {
        const { data } = await octokit.rest.repos.get(REPOSITORY);
        res.setHeader('Cache-Control', CACHE.slow);
        /**
         * Only the five fields the UI reads. Forwarding Octokit's whole payload would ship the
         * owner's account object and every URL template to the client for no reason, and would
         * make the response shape GitHub's to change rather than ours.
         */
        res.status(200).json({
            stars: data.stargazers_count,
            forks: data.forks_count,
            watchers: data.subscribers_count,
            issues: data.open_issues_count,
            pushedAt: data.pushed_at,
        });
    } catch (err: unknown) {
        // Was forwarding Octokit's raw message. Under rate limiting GitHub answers "API rate limit
        // exceeded for user ID 12345", disclosing the owner's numeric account id; on a revoked token
        // it answers "Bad credentials", which is a live oracle for when the PAT was rotated or broke.
        // Log the detail, return a flat message like the other seven routes.
        console.error('GitHub stars API Error:', err);
        res.setHeader('Cache-Control', CACHE.error);
        res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
});
