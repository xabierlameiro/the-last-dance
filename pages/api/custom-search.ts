// This endpoint is used to search in google with custom search engine

import type { NextApiRequest, NextApiResponse } from 'next';

import { google } from 'googleapis';

const customsearch = google.customsearch('v1');

const API_KEY = 'AIzaSyASPnCLkPPePMnqPm6EhbM8k8tx5sZH4PQ';

const CX = 'd4bc1db527ead4e71';

// https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const response = await customsearch.cse
        .list({
            cx: CX,
            q: 'site:xabierlameiro.com',
            auth: API_KEY,
            start: 11,
        })
        .then((response) => response.data);

    res.status(200).json({
        searchTime: response.searchInformation?.searchTime,
        totalResults: response.searchInformation?.totalResults,
        searchTerm: response?.queries?.request?.[0].searchTerms,
    });
}
