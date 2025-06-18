import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { handleCors } from '../../../helpers/cors'

/**
 * @description Get data from Google Search Console API
 * @example GET /api/console
 */
export async function GET() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.ANALYTICS_CLIENT_EMAIL,
                private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: 'https://www.googleapis.com/auth/webmasters',
        })

        const webmasters = google.webmasters({
            version: 'v3',
            auth,
        })

        const response = await webmasters.searchanalytics.query({
            siteUrl: 'sc-domain:xabierlameiro.com',
            requestBody: {
                startDate: '2023-01-01',
                endDate: '2023-12-30',
                dataState: 'ALL',
                dimensions: ['page'],
            },
        })

        const successResponse = NextResponse.json(response.data)
        return handleCors(successResponse)
    } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 })
        return handleCors(errorResponse)
    }
}