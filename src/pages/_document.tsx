import { Html, Head, Main, NextScript } from 'next/document';
import { author, authorAlternateName, defaultLocale, personDescription, socialNetworks } from '@/constants/site';

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
                <meta name="theme-color" content="#FFF" />
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
