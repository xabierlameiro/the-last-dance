import https from 'https';

// Create an HTTPS agent that ignores self-signed certificates in development
const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV !== 'development'
});

/**
 * Custom fetch function with SSL certificate handling for development
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // For Node.js environment, add the agent to handle SSL certificates
    if (typeof window === 'undefined' && url.startsWith('https:')) {
        // @ts-ignore - Adding Node.js specific agent option
        options.agent = httpsAgent;
    }

    return fetch(url, options);
}
