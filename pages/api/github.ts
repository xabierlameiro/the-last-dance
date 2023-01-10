import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const REPOSITORY = {
    owner: 'xabierlameiro',
    repo: 'the-last-dance',
};

/**
 * @description This function is used to get the total number of stars for a given repository. It uses the GitHub and
 * put a star on it.
 *
 * @example
 *     GET /api/github
 *     GET /api/github?starred=true
 *     POST /api/github
 *     DELETE /api/github
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { starred } = req.query;

    if (req.method === 'GET') {
        if (!starred) {
            try {
                const {
                    data: { stargazers_count },
                } = await octokit.rest.repos.get(REPOSITORY);
                res.status(200).json(stargazers_count);
            } catch (err: any) {
                res.status(500).json({ statusCode: 500, message: err.message });
            }
        } else {
            try {
                await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser(REPOSITORY);
                res.status(200).json(true);
            } catch (err: any) {
                if (err.status === 404) {
                    res.status(200).json(false);
                } else {
                    res.status(500).json({ statusCode: 500, message: err.message });
                }
            }
        }
    }

    if (req.method === 'POST') {
        try {
            await octokit.rest.activity.starRepoForAuthenticatedUser(REPOSITORY);
            res.status(200).json({ message: 'starred' });
        } catch (err: any) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await octokit.rest.activity.unstarRepoForAuthenticatedUser(REPOSITORY);
            res.status(200).json({ message: 'unstarred' });
        } catch (err: any) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    }
}
