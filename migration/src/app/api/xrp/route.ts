import { NextRequest, NextResponse } from 'next/server';
import jsdom from 'jsdom';

/**
 * @description Get the price of XRP in EUR
 *
 * @returns {Promise<{ price: string; todaySummary: string; todayPorcentage: string } | { error: string }>}
 * @example https://xabierlameiro.com/api/xrp
 */
export async function GET(_req: NextRequest) {
    const { JSDOM } = jsdom;

    try {
        const response = await fetch('https://www.google.com/search?q=xrp+eur+price', {
            method: 'GET',
            headers: new Headers({
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'cache-control': 'max-age=0',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch XRP price');
        }

        const raw = await response.text();
        const dom = new JSDOM(raw);
        const price = dom.window.document.querySelector('.pclqee')?.textContent;
        const todaySummary = dom.window.document.querySelector('[jsname="SwWl3d"]')?.textContent;
        const todayPorcentage = dom.window.document.querySelector('[jsname="rfaVEf"]')?.textContent;

        return NextResponse.json({
            price,
            todaySummary,
            todayPorcentage,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
}
