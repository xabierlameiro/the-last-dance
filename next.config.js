/** @type {import('next').NextConfig} */
import { remarkCodeHike } from '@xabierlameiro/code-hike';
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
        ];
    },
    // Append the default value with md extensions
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['uploads-ssl.webflow.com', 'code.visualstudio.com'],
    },
});
