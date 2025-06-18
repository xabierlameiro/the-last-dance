import { NextResponse } from 'next/server'
import { handleCors } from '../../../helpers/cors'

interface CoinGeckoResponse {
    ripple: {
        eur: number;
        eur_24h_change: number;
    };
}

/**
 * @description Get the price of XRP in EUR using CoinGecko API
 * @example GET /api/xrp
 */
export async function GET() {
    try {
        // Using CoinGecko free API - more reliable than scraping
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=eur&include_24hr_change=true',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
                },
                // Next.js 15: Use no-store for fresh data on every request
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CoinGeckoResponse = await response.json();
        
        if (!data.ripple) {
            throw new Error('XRP price data not found');
        }

        const price = `${data.ripple.eur.toFixed(4)} €`;
        const change = data.ripple.eur_24h_change;
        const todayPorcentage = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        const todaySummary = change >= 0 ? 'Up' : 'Down';

        const successResponse = NextResponse.json({
            price,
            todaySummary,
            todayPorcentage,
        });
        return handleCors(successResponse);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 });
        return handleCors(errorResponse);
    }
}
        