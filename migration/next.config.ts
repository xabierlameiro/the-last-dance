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
