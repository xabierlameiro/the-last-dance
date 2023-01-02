import { Html, Head, Main, NextScript } from 'next/document';
import { domain, author, socialNetworks } from '@/constants/site';

const Document = (props: any) => {
    return (
        <Html lang={props.__NEXT_DATA__.locale}>
            <Head>
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#FFF" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={author} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="300" />
                <meta property="og:image:height" content="300" />
                <meta property="og:url" content={domain} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@xlameiro" />
                <meta name="twitter:creator" content="@xlameiro" />
                <meta name="robots" content="all" />
                <meta name="googlebot" content="all" />
                <meta name="google" content="notranslate" />
                <link rel="icon" href="/favicon.svg" title="The favicon" />
                <script
                    type="application/ld+json"
                    key="website-jsonld"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            url: domain,
                            name: author,
                            alternateName: author,
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'http://schema.org',
                            '@type': 'Person',
                            name: author,
                            url: domain,
                            sameAs: socialNetworks,
                            email: 'mailto:xabier.lameiro@gmail.com',
                            image: '/profile.png',
                            jobTitle: 'Front-end Developer',
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: 'As Cortiñas, Moraña',
                                addressRegion: 'Pontevedra (Spain)',
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
