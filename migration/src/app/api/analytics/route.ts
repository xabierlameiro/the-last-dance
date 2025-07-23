import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { handleCors } from '../../../helpers/cors'

interface AnalyticsData {
    pageViews: string | number;
    newUsers: string | number;
}

/**
 * @description Get analytics data for page views and new users
 * @example GET /api/analytics?slug=/blog/my-post
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.ANALYTICS_PROJECT_ID,
    })

    try {
        let data: AnalyticsData

        if (!slug) {
            // Get overall analytics data
            const [response] = await analyticsDataClient.runReport({
                property: `properties/348472560`,
                dateRanges: [
                    {
                        startDate: '2023-01-01',
                        endDate: 'today',
                    },
                ],
                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'newUsers',
                    },
                ],
            })

            if (!response?.rows) {
                const errorResponse = NextResponse.json({ error: 'No data' }, { status: 500 })
                return handleCors(errorResponse)
            }

            data = {
                pageViews: response?.rows?.[0].metricValues?.[0].value ?? 0,
                newUsers: response?.rows?.[0].metricValues?.[1].value ?? 0,
            }
        } else {
            // Get analytics data for specific page
            const [response] = await analyticsDataClient.runReport({
                property: `properties/348472560`,
                dateRanges: [
                    {
                        startDate: '2023-01-01',
                        endDate: 'today',
                    },
                ],
                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'newUsers',
                    },
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'pagePath',
                        stringFilter: {
                            matchType: 'EXACT',
                            value: slug,
                        },
                    },
                },
            })

            if (!response?.rows || typeof response.rowCount !== 'number') {
                const errorResponse = NextResponse.json(
                    { error: 'Error while parsing analytics data' },
                    { status: 500 }
                )
                return handleCors(errorResponse)
            }

            if (response.rowCount > 0) {
                data = {
                    pageViews: response?.rows?.[0].metricValues?.[0].value ?? 0,
                    newUsers: response?.rows?.[0].metricValues?.[1].value ?? 0,
                }
            } else {
                data = {
                    pageViews: 0,
                    newUsers: 0,
                }
            }
        }

        const successResponse = NextResponse.json({
            pageViews: data.pageViews,
            newUsers: data.newUsers,
        })
        return handleCors(successResponse)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 })
        return handleCors(errorResponse)
    }
}