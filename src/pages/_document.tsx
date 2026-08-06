import { Html, Head, Main, NextScript } from 'next/document';
import { author, authorAlternateName, defaultLocale, personDescription, socialNetworks } from '@/constants/site';
import { THEME_STORAGE_KEY } from '@/hooks/useDarkMode';

/**
 * Resolves the theme before the first paint.
 *
 * `data-theme` below is rendered as "light" because the server cannot know the visitor's
 * preference — there is no request header for it. `useDarkMode` corrects it, but only after React
 * mounts, and only on the one page that mounts the hook (/settings), so every other route stayed
 * light no matter what the OS said. This blocking script runs in the `<head>`, before the body is
 * painted, on every route: no flash, and no dependency on which components happen to mount.
 */
const themeBootstrap = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=s==='dark'||s==='light'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

type Props = {
    __NEXT_DATA__: {
        locale: string;
    };
};
const Document = (props: Props) => {
    const locale = props.__NEXT_DATA__.locale ?? defaultLocale;

    return (
        <Html lang={locale} data-theme="light">
            <Head>
                <meta charSet="utf-8" />
                <script
                    // skipcq: JS-0440 - static string built at module scope, no user input reaches it
                    dangerouslySetInnerHTML={{ __html: themeBootstrap }}
                />
                {/*
                 * One `theme-color` per scheme so the browser chrome matches the page. These follow
                 * the OS preference rather than an explicit toggle — the meta element has no way to
                 * read localStorage — so a visitor who overrides the theme keeps the chrome of their
                 * OS setting. Values are --blog-background for each theme.
                 */}
                <meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#1E1E1E" media="(prefers-color-scheme: dark)" />
                <meta property="og:site_name" content={author} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@xlameirodev" />
                <meta name="twitter:creator" content="@xlameirodev" />
                {/*
                 * SDD-L04: `<meta name="google" content="notranslate">` used to sit here. It suppresses
                 * Google's offer to translate the page — on a site that deliberately publishes in three
                 * languages and declares reciprocal hreflang for them. It also does nothing for the
                 * locales that are not covered. Removed; the per-locale `lang` attribute and hreflang
                 * already tell Google what each page is written in.
                 */}
                <link rel="icon" href="/favicon.png" title="The favicon" />
                <link rel="apple-touch-icon" href="/favicon.png" />
                {/*
                 * Feed autodiscovery. This lives in _document rather than the SEO
                 * component so it is present on every page including the ones SEO does not cover
                 * (the /blog and /blog/<category> hubs, which redirect from getStaticProps).
                 * Filenames are suffixed, not prefixed: `public/es/feed.xml` would be served at
                 * /es/feed.xml, but i18n consumes `/es` as a locale prefix before the static
                 * handler sees the path, so it resolves to the English file. Keep in sync with
                 * CHANNELS in scripts/generate-feeds.mjs.
                 */}
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title={`Xabier Lameiro — Blog (${locale})`}
                    href={locale === defaultLocale ? '/feed.xml' : `/feed.${locale}.xml`}
                />
                <script
                    type="application/ld+json"
                    key="website-jsonld"
                    // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#website`,
                            url: process.env.NEXT_PUBLIC_DOMAIN,
                            name: author,
                            inLanguage: ['en', 'es', 'gl'],
                            publisher: { '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#person` },
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Person',
                            '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#person`,
                            name: author,
                            alternateName: authorAlternateName,
                            url: process.env.NEXT_PUBLIC_DOMAIN,
                            // The home page presents the bio as source code inside the editor
                            // window, which crawlers read as <code>, not as prose. Carrying the
                            // same facts here keeps them machine-readable now that /about is gone,
                            // in the language of the page being described.
                            description: personDescription[locale] ?? personDescription[defaultLocale],
                            // SDD-L04: `mainEntityOfPage: '#profilepage'` used to sit here. This node is
                            // emitted on every page, but #profilepage is only defined on the home page
                            // (index.tsx), so on the ~54 other URLs it was a dangling @id. The home page's
                            // ProfilePage node already points the other way with `mainEntity: '#person'`,
                            // which is the correct direction, so nothing is lost by removing it.
                            sameAs: socialNetworks,
                            email: 'mailto:xabier.lameiro@gmail.com',
                            image: {
                                '@type': 'ImageObject',
                                url: `${process.env.NEXT_PUBLIC_DOMAIN}/xabier-lameiro.jpg`,
                                width: 1000,
                                height: 1000,
                                caption: author,
                            },
                            jobTitle: 'Software Architect',
                            knowsAbout: ['Web development', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'IoT'],
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: 'Moraña',
                                addressRegion: 'Pontevedra',
                                addressCountry: 'ES',
                            },
                        }),
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};
export default Document;
