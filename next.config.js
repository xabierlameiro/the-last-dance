/** @type {import('next').NextConfig} */
import { remarkCodeHike } from '@code-hike/mdx';
import theme from 'shiki/themes/one-dark-pro.json' with { type: 'json' };
import nextMDX from '@next/mdx';

const withMDX = nextMDX({
    extension: /\.mdx?$/,
    options: {
        // If you use remark-gfm, you'll need to use next.config.mjs
        // as the package is ESM only
        // https://github.com/remarkjs/remark-gfm#install
        remarkPlugins: [[remarkCodeHike, { theme }]],
        rehypePlugins: [],
        // If you use `MDXProvider`, uncomment the following line.
        // providerImportSource: "@mdx-js/react",
    },
});

export default withMDX({
    // /about and /contact were standalone pages rendering a plain white panel, which broke the
    // macOS-desktop premise: the only "apps" this site has are the Dock items. Both were already
    // duplicating the home page, where the VS Code window shows the bio (index.tsx), the
    // experience (knowledge.module.css) and the contact details (contact.json) as its three tabs.
    // The home is the entity page, so the two URLs fold into it. With i18n configured, `source`
    // and `destination` are prefixed for every locale automatically, so these two entries cover
    // /about, /es/about and /gl/about and pass the locale through. `permanent: true` emits 308,
    // which Google consolidates exactly like a 301.
    redirects: async () => {
        return [
            { source: '/about', destination: '/', permanent: true },
            { source: '/contact', destination: '/', permanent: true },
        ];
    },
    rewrites: async () => {
        return [
            {
                source: '/:coverage',
                destination: '/:coverage/index.html',
            },
            {
                source: '/docs/:path*',
                destination: '/docs/:path*',
            },
        ];
    },
    // Append the default value with md extensions
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    experimental: {
        largePageDataBytes: 800 * 1000,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ssl.gstatic.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gstatic.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'uploads-ssl.webflow.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'code.visualstudio.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'googlecm.hit.gemius.pl',
                pathname: '/**',
            },
        ],
    },
    i18n: {
        locales: ['en', 'es', 'gl'],
        defaultLocale: 'en',
        localeDetection: false,
    },
    headers: async () => {
        return [
            {
                source: '/:path*',
                headers: [
                    // Security headers
                    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    // More restrictive CSP
                    // connect-src must allow GA4 collection endpoints and script-src/frame-src
                    // must allow AdSense, otherwise the CSP silently drops analytics hits and ads
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://ep2.adtrafficquality.google; connect-src 'self' https://api.vercel.com https://api.coingecko.com https://www.ariston-net.remotethermo.com https://www.google.com https://news.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://csi.gstatic.com;"
                    },
                    // CORS for API routes is handled per-route by src/helpers/cors.ts
                ],
            }
        ];
    },
});
