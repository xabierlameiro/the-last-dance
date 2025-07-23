import { NextResponse } from 'next/server'
import { Octokit } from 'octokit'
import { handleCors } from '../../../helpers/cors'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const REPOSITORY = {
    owner: 'xabierlameiro',
    repo: 'the-last-dance',
}

/**
 * @description Get the total number of stars for the repository
 * @example GET /api/github-stars
 */
export async function GET() {
    try {
        const {
            data: { stargazers_count },
        } = await octokit.rest.repos.get(REPOSITORY)

        const response = NextResponse.json(stargazers_count)
        return handleCors(response)
    } catch (err: unknown) {
        let statusCode = 500
        let message = 'Unknown error'

        if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
            const errorObj = err as { status: number; message: string }
            statusCode = errorObj.status
            message = errorObj.message
        }

        const errorResponse = NextResponse.json(
            { statusCode, message },
            { status: 500 }
        )
        return handleCors(errorResponse)
    }
}