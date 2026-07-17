// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jsdom from 'jsdom';
import allowCors from '../../helpers/cors';

interface NewsItem {
    title: string;
    description: string;
    link: string;
    published: string;
}

interface NewsData {
    city: string;
    news: NewsItem[];
}

type NewsResponse = NewsData | { error: string };

const MAX_NEWS_ITEMS = 10;

/**
 * @description Get the latest news for a city from the Google News RSS feed.
 * Replaces the old Google SERP scraper (hardcoded CSS selectors) that was
 * blocked by bot detection and silently returned an empty list (SDD-001).
 *
 * @param city {string} - City as sent by the UI, e.g. "limerick+ireland"
 * @returns Promise<NewsData>
 * @example getCityNews('limerick+ireland')
 */
const getCityNews = async (city: string): Promise<NewsData> => {
    const query = city.replace(/\+/g, ' ').trim();

    const url = new URL('https://news.google.com/rss/search');
    url.searchParams.set('q', query);
    url.searchParams.set('hl', 'en-US');
    url.searchParams.set('gl', 'US');
    url.searchParams.set('ceid', 'US:en');

    const response = await fetch(url.toString(), {
        headers: { accept: 'application/rss+xml, application/xml, text/xml' },
        redirect: 'follow',
    });
    if (!response.ok) {
        throw new Error(`News RSS HTTP error! status: ${response.status}`);
    }

    const raw = await response.text();
    const { JSDOM } = jsdom;
    const document = new JSDOM(raw, { contentType: 'text/xml' }).window.document;

    const news = Array.from(document.querySelectorAll('item'))
        .slice(0, MAX_NEWS_ITEMS)
        .map((item) => {
            const pubDate = item.querySelector('pubDate')?.textContent?.trim() ?? '';
            const parsedDate = pubDate ? new Date(pubDate) : null;
            return {
                title: item.querySelector('title')?.textContent?.trim() ?? '',
                // The RSS <description> just repeats the headline as HTML; the outlet name is more useful
                description: item.querySelector('source')?.textContent?.trim() ?? '',
                link: item.querySelector('link')?.textContent?.trim() ?? '',
                published:
                    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : pubDate,
            };
        })
        .filter((item) => item.title && item.link);

    return { city, news };
};

/**
 *
 * @description Get news for a city
 * @param req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/news?city=London
 */
export default allowCors(async function handler(
    req: NextApiRequest,
    res: NextApiResponse<NewsResponse>
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query } = req;
    const { city } = query;

    // Validate city parameter
    if (!city || typeof city !== 'string') {
        return res.status(400).json({ error: 'City parameter is required and must be a string' });
    }

    // Validate city format — '+' is allowed because the UI sends "city+region" pairs
    if (city.length < 2 || city.length > 50 || !/^[a-zA-ZÀ-ÿ\s+-]+$/.test(city)) {
        return res.status(400).json({ error: 'Invalid city name format' });
    }

    try {
        const data = await getCityNews(city);
        res.status(200).json(data);
    } catch (error) {
        console.error('News API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
