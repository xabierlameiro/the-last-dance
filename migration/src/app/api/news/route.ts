import { NextRequest, NextResponse } from 'next/server'
import { handleCors } from '../../../helpers/cors'

interface NewsItem {
    title: string | null;
    description: string | null;
    link: string | undefined;
    published: string | null;
}

interface NewsData {
    city: string;
    news: NewsItem[];
}

const getNewsData = async (city: string): Promise<NewsData> => {
    try {
        // Using RSS feeds from public sources (no API key needed)
        // El País RSS feed for Spanish news
        const response = await fetch(
            'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                    'User-Agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`RSS feed error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        
        // Simple XML parsing for RSS items
        const items = parseRSSItems(xmlText);
        
        // Filter and format news items
        const news: NewsItem[] = items.slice(0, 5).map(item => ({
            title: item.title,
            description: item.description,
            link: item.link,
            published: formatDate(item.pubDate),
        }));

        return {
            city,
            news,
        };
    } catch (error) {
        console.error(`Failed to fetch news for ${city}:`, error);
        throw new Error(`Failed to fetch news data for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const parseRSSItems = (xmlText: string) => {
    const items: Array<{
        title: string;
        description: string;
        link: string;
        pubDate: string;
    }> = [];

    // Simple regex-based XML parsing (for production, consider using a proper XML parser)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i;
    const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/i;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
    const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;

    let match;
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) {
        const itemContent = match[1];
        
        const titleMatch = titleRegex.exec(itemContent) || /<title[^>]*>(.*?)<\/title>/i.exec(itemContent);
        const descMatch = descRegex.exec(itemContent) || /<description[^>]*>(.*?)<\/description>/i.exec(itemContent);
        const linkMatch = linkRegex.exec(itemContent);
        const pubDateMatch = pubDateRegex.exec(itemContent);

        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1]?.trim() ?? 'Sin título',
                description: descMatch?.[1]?.trim() ?? 'Sin descripción',
                link: linkMatch[1]?.trim() ?? '',
                pubDate: pubDateMatch?.[1]?.trim() ?? new Date().toISOString(),
            });
        }
    }

    return items;
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Hace menos de 1 hora';
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES');
    } catch {
        return 'Fecha desconocida';
    }
};

/**
 * @description Get news for a city using NewsAPI
 * @example GET /api/news?city=Madrid
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city || typeof city !== 'string') {
        const errorResponse = NextResponse.json(
            { error: 'City must be a string' },
            { status: 400 }
        )
        return handleCors(errorResponse)
    }

    try {
        const data = await getNewsData(city)

        if (!data?.city || !data?.news) {
            const errorResponse = NextResponse.json(
                { error: 'Error getting news data' },
                { status: 500 }
            )
            return handleCors(errorResponse)
        }

        const response = NextResponse.json({
            city: data.city,
            news: data.news,
        })
        return handleCors(response)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 })
        return handleCors(errorResponse)
    }
}