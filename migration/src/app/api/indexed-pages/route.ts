import { NextResponse } from 'next/server'

/**
 * @description Get the number of indexed pages by reading sitemap.xml
 * @example GET /api/indexed-pages
 */
export async function GET() {
    try {
        // Read sitemap.xml from the domain to count indexed pages
        const sitemapUrl = 'https://xabierlameiro.com/sitemap.xml';
        const response = await fetch(sitemapUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
                'Accept': 'application/xml, text/xml',
            },
            // Next.js 15: Use no-store for fresh data on every request
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.status}`);
        }

        const sitemapContent = await response.text();
        
        // Count <url> or <loc> elements in sitemap
        const urlMatches = sitemapContent.match(/<url>/g);
        const locMatches = sitemapContent.match(/<loc>/g);
        
        // Use whichever gives a result, prioritize url tags
        const num = urlMatches?.length ?? locMatches?.length ?? 0;

        const successResponse = NextResponse.json({ num });
        return successResponse;
    } catch (err: unknown) {
        console.error('Error fetching indexed pages:', err);
        
        // If sitemap fails, return an error without fallback
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        const errorResponse = NextResponse.json({ 
            error: errorMessage,
            num: 0 
        }, { status: 500 });
        return errorResponse;
    }
}