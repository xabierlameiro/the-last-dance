import type { NextConfig } from 'next';
import { remarkPlugins } from './mdx.plugins.ts';
import nextMDX from '@next/mdx';

const withMDX = nextMDX({
    extension: /\.mdx?$/,
    options: {
        /*
         * SDD-L09-T7: this pipeline had its own plugin array, without remark-gfm, while
         * next-mdx-remote had one with it. Same syntax, two sets of rules, depending only on how a
         * given .mdx file happened to be loaded. Both import `mdx.plugins.ts` now.
         */
        // @next/mdx compiles a real module, so Code Hike can inject the `CH` import itself.
        remarkPlugins: remarkPlugins({ autoImport: true }),
        rehypePlugins: [],
        // If you use `MDXProvider`, uncomment the following line.
        // providerImportSource: "@mdx-js/react",
    },
});

const nextConfig: NextConfig = {
    // /about and /contact were standalone pages rendering a plain white panel, which broke the
    // macOS-desktop premise: the only "apps" this site has are the Dock items. Both were already
    // duplicating the home page, where the VS Code window shows the bio (index.tsx), the
    // experience (knowledge.module.css) and the contact details (contact.json) as its three tabs.
    // The home is the entity page, so the two URLs fold into it. With i18n configured, `source`
    // and `destination` are prefixed for every locale automatically, so these two entries cover
    // /about, /es/about and /gl/about and pass the locale through. `permanent: true` emits 308,
    // which Google consolidates exactly like a 301.
    // The /blog and /blog/<category> hubs redirect from getStaticProps instead of here, even
    // though the docs prefer config for build-time redirects: their destination is a per-locale
    // slug, and a locale-varying destination needs `locale: false`, whose matcher runs against
    // the raw path. That works for /es and /gl but cannot express the default locale — neither
    // `/blog` nor `/en/blog` as source ever matches an incoming `/blog`, which then 404s.
    redirects: async () => {
        return [
            { source: '/about', destination: '/', permanent: true },
            { source: '/contact', destination: '/', permanent: true },
        ];
    },
    // SDD-L04: two rewrites removed here.
    //  - `/:coverage -> /:coverage/index.html` read as the literal path /coverage, but `:coverage` is a
    //    named parameter matching ANY single segment. Harmless today because array rewrites run
    //    `afterFiles`, so pages and public files resolve first — but it would have silently swallowed
    //    the first top-level dynamic route anyone added, and the failure would have looked like a
    //    routing bug rather than a config one.
    //  - `/docs/:path* -> /docs/:path*` was byte-identical to its source, i.e. a no-op, and targeted
    //    a public/docs directory that does not exist (it is generated on demand by `npm run jsdoc`
    //    and excluded by .vercelignore).
    // Append the default value with md extensions
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    experimental: {
        /*
         * SDD-L09-T4, partially. This was 800 KB, which is not a fix for anything — it raises the
         * threshold at which Next warns that a page's JSON is too large, so it silenced the warning
         * about the blog payload rather than addressing it.
         *
         * The spec's target was 128 KB, and this does not reach it. Trimming the theme (T1) removed
         * the VS Code UI colour map but that was only ~6 KB of a 460 KB page: the bulk is Code Hike's
         * tokenised output — one object per token with an inline hex colour, 2,085 of them on the
         * worst page. Collapsing those needs T2 (CSS-variable theming) or T3 (render highlighted
         * HTML in getStaticProps), and both are gated on decision D4, which is still open.
         *
         * So this is a ratchet, not the destination: 480 KB is just above today's worst page (454 KB),
         * which means any future change that inflates a payload trips the warning during the build.
         * Lower it again as T2/T3 land.
         */
        largePageDataBytes: 480 * 1000,
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
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
                    // connect-src must allow GA4 collection endpoints and script-src/frame-src
                    // must allow AdSense, otherwise the CSP silently drops analytics hits and ads.
                    //
                    // SDD-L02 tightening. Three changes, each chosen because it costs nothing here:
                    //  - `base-uri 'none'` and `form-action 'self'` added. Neither falls back to
                    //    `default-src`, so their absence was a real gap rather than a stylistic one.
                    //  - `object-src 'none'` and `frame-ancestors 'none'` added. Both were already
                    //    covered in effect (the first by the default-src fallback, the second by
                    //    X-Frame-Options: DENY) — stated explicitly so the next reader need not derive it.
                    //  - `img-src` narrowed off the `https:` wildcard. The wildcard existed for AdSense
                    //    creatives from arbitrary advertiser CDNs, but AdSense is disabled
                    //    (GoogleAdsense/index.tsx sets ADSENSE_ENABLED = false and returns null), so it
                    //    currently buys nothing. **Widen it again when ads are re-enabled.**
                    //
                    // `'unsafe-eval'` STAYS, and this was verified rather than reasoned about. The audit
                    // claimed nothing in the production bundle needs it; removing it and loading the
                    // built site in a browser produced, on the home page:
                    //   EvalError: Evaluating a string as JavaScript violates the following Content
                    //   Security Policy directive... at new Function (<anonymous>) ... Object.useMemo
                    // The caller is next-mdx-remote's MDXRemote, which evaluates `compiledSource` with
                    // `new Function` during hydration. Every page that renders MDX therefore needs it,
                    // which is the home page and every blog post. It becomes removable only if the MDX
                    // pipeline stops shipping a compiled module to the client (see SDD-L09-T3, rendering
                    // highlighted HTML in getStaticProps instead) — so this directive is blocked on that
                    // work, not on a decision.
                    //
                    // `'unsafe-inline'` in script-src stays, deliberately. It is load-bearing for the
                    // inline GA bootstrap in _app.tsx and four JSON-LD blocks. Removing it needs
                    // per-request nonces, which in the Pages Router means middleware minting a nonce
                    // threaded through _document — forcing currently-static pages onto a dynamic path
                    // and losing the full-static rendering this codebase deliberately preserves. For a
                    // static site with no authenticated session and no injection sink, that is a bad
                    // trade. Recorded as a decision, not an oversight.
                    //
                    // COEP `require-corp` is likewise not set: it would block GA4, AdSense and Google
                    // Fonts outright, none of which serve CORP headers.
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://*.googlesyndication.com https://ssl.gstatic.com https://gstatic.com https://code.visualstudio.com https://uploads-ssl.webflow.com https://googlecm.hit.gemius.pl; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://ep2.adtrafficquality.google; connect-src 'self' https://api.vercel.com https://api.coingecko.com https://www.ariston-net.remotethermo.com https://www.google.com https://news.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://csi.gstatic.com;",
                    },
                    // CORS for API routes is handled per-route by src/helpers/cors.ts
                ],
            },
        ];
    },
};

export default withMDX(nextConfig);
