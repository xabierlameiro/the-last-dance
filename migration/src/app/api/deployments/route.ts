import { NextResponse } from 'next/server'
import { handleCors } from '../../../helpers/cors'

export type DeploymentStatus = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED'
export type Deploymentenvironment = 'production' | 'preview'

export type DeploymentResponse = {
    status: DeploymentStatus;
    environment: Deploymentenvironment;
    createdAt: string;
    buildingAt: string;
    ready: string;
    username: string;
}

/**
 * @description Get the last deployment status
 * @example GET /api/deployments
 */
export async function GET() {
    try {
        const result = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${process.env.NEXT_PROJECT_ID}&target=${process.env.NEXT_PUBLIC_ENV}&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_TOKEN}`,
                },
                method: 'GET',
            }
        )

        const data = await result.json()

        const deploymentData: DeploymentResponse = {
            status: data.deployments[0]['state'],
            environment: process.env.NEXT_PUBLIC_ENV as 'production' | 'preview',
            createdAt: data.deployments[0]['createdAt'],
            buildingAt: data.deployments[0]['buildingAt'],
            ready: data.deployments[0]['ready'],
            username: data.deployments[0]['creator']['username'],
        }

        const response = NextResponse.json(deploymentData)
        return handleCors(response)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 })
        return handleCors(errorResponse)
    }
}