import createMDX from '@next/mdx'
import { remarkCodeHike, recmaCodeHike } from 'codehike/mdx'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Configure pageExtensions to include markdown and MDX files
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        largePageDataBytes: 800 * 1000,
    },
    // Headers configuration for security
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'false' },
                    { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_DOMAIN ?? 'https://xabierlameiro.com' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ];
    },
    // Redirects for legacy URLs
    async redirects() {
        return [
            {
                source: '/legal/:slug*',
                destination: '/es/legal/:slug*',
                permanent: true,
            },
            {
                source: '/blog/:path*',
                destination: '/es/blog/:path*',
                permanent: true,
            },
            {
                source: '/settings',
                destination: '/es/settings',
                permanent: true,
            },
            {
                source: '/survey',
                destination: '/es/survey',
                permanent: true,
            },
            {
                source: '/comments',
                destination: '/es/comments',
                permanent: true,
            },
        ];
    },
};

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
    components: { code: "Code" },
}

const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [[remarkCodeHike, chConfig]],
        recmaPlugins: [[recmaCodeHike, chConfig]],
        jsx: true,
    },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
