/** @type {import('next').NextConfig} */
import { remarkCodeHike } from '@code-hike/mdx';
import theme from 'shiki/themes/one-dark-pro.json' assert { type: 'json' };
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
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    experimental: {
        appDir: false,
        largePageDataBytes: 800 * 1000,
    },
    images: {
        domains: [
            'ssl.gstatic.com',
            'gstatic.com',
            'uploads-ssl.webflow.com',
            'code.visualstudio.com',
            'googlecm.hit.gemius.pl',
        ],
    },
    i18n: {
        locales: ['en', 'es', 'gl'],
        defaultLocale: 'en',
        localeDetection: false,
    },
    headers: {
        source: '/:path*',
        headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
    },
});
