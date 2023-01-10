import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * @description This function is used to get the total number of stars for a given repository. It uses the GitHub and
 * put a star on it.
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse<Data>} res
 * @returns {Promise<{
 *     error?: string;
 *     total?: number;
 * }>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const {
                data: { stargazers_count },
            } = await octokit.rest.repos.get({
                owner: 'xabierlameiro',
                repo: 'the-last-dance',
            });

            res.status(200).json(stargazers_count);
        } catch (err: any) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            await octokit.rest.activity.starRepoForAuthenticatedUser({
                owner: 'xabierlameiro',
                repo: 'the-last-dance',
                request: {
                    mediaType: {
                        previews: ['squirrel'],
                    },
                },
            });

            res.status(200).json({ message: 'starred' });
        } catch (err: any) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await octokit.rest.activity.unstarRepoForAuthenticatedUser({
                owner: 'xabierlameiro',
                repo: 'the-last-dance',
                request: {
                    mediaType: {
                        previews: ['squirrel'],
                    },
                },
            });

            res.status(200).json({ message: 'unstarred' });
        } catch (err: any) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    }
}
