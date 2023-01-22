import type { NextApiRequest, NextApiResponse } from 'next';

import { google } from 'googleapis';

const customsearch = google.customsearch('v1');

// https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const response = await customsearch.cse
        .list({
            cx: process.env.GOOGLE_CLIENT_ID,
            auth: process.env.GOOGLE_API_KEY,
            q: 'site:xabierlameiro.com',
        })
        .then((response) => response.data);

    res.status(200).json({
        searchTime: response.searchInformation?.searchTime,
        totalResults: response.searchInformation?.totalResults,
        searchTerm: response?.queries?.request?.[0].searchTerms,
    });
}
