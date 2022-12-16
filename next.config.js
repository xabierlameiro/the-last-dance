/** @type {import('next').NextConfig} */
const { remarkCodeHike } = require("@code-hike/mdx");
const theme = require("shiki/themes/one-dark-pro.json");

const withMDX = require("@next/mdx")({
    extension: /\.mdx?$/,
    options: {
        // If you use remark-gfm, you'll need to use next.config.mjs
        // as the package is ESM only
        // https://github.com/remarkjs/remark-gfm#install
        remarkPlugins: [
            [
                remarkCodeHike,
                {
                    theme,
                    showCopyButton: true,
                },
            ],
        ],
        rehypePlugins: [],
        // If you use `MDXProvider`, uncomment the following line.
        // providerImportSource: "@mdx-js/react",
    },
});
module.exports = withMDX({
    // Append the default value with md extensions
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    experimental: {
        appDir: true,
    },
});
