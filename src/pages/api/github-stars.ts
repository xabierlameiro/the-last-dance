import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';
import allowCors from '../../helpers/cors';

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
type GitHubStarsResponse = number | { statusCode: number; message: string };

export default allowCors(async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<GitHubStarsResponse>
) {
    try {
        const {
            data: { stargazers_count },
        } = await octokit.rest.repos.get(REPOSITORY);
        res.status(200).json(stargazers_count);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
            const { status, message } = err as { status: number; message: string };
            res.status(500).json({ statusCode: status, message });
        } else {
            res.status(500).json({ statusCode: 500, message: 'Unknown error' });
        }
    }
});
