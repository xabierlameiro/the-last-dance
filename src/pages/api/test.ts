import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<{}>) {
    try {
        // Set up deployment configuration

        const result = await fetch('https://api.vercel.com/v13/deployments?teamId=team_qDM6ZNuTT37IbW2UE8dD2hGc', {
            body: {
                name: 'the-last-dance-e2e',
                files: [{ file: 'index.html', data: '<html><body>Hello, world!</body></html>' }],
                projectSettings: {
                    framework: null,
                    buildCommand: "echo 'no build step required'",
                    outputDirectory: '/',
                },
            },
            headers: {
                Authorization: 'Bearer v8QiIRVp7jPzhoBuG8taRb4N',
                'Content-Type': 'application/json',
                Accept: 'application/json, text/plain, */*',
                'User-Agent': '*',
            },
            method: 'POST',
        });
        const data = await result.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
}
