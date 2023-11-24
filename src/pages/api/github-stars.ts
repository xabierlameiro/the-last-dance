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
export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            data: { stargazers_count },
        } = await octokit.rest.repos.get(REPOSITORY);
        res.status(200).json(stargazers_count);
    } catch (err: any) {
        res.status(500).json({ statusCode: err.status, message: err.message });
    }
});
