import { Html, Head, Main, NextScript } from 'next/document';
import { author, socialNetworks } from '@/constants/site';

type Props = {
    __NEXT_DATA__: {
        locale: string;
    };
};
const Document = (props: Props) => {
    return (
        <Html lang={props.__NEXT_DATA__.locale} data-theme="light">
            <Head>
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#FFF" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={author} />
                <meta property="og:image:type" content="image/png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@xlameirodev" />
                <meta name="twitter:creator" content="@xlameirodev" />
                <meta name="google" content="notranslate" />
                <link rel="icon" href="/favicon.svg" title="The favicon" />
                <script
                    async
                    crossOrigin="anonymous"
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                />

                <script
                    type="application/ld+json"
                    key="website-jsonld"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            url: process.env.NEXT_PUBLIC_DOMAIN,
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
                            url: process.env.NEXT_PUBLIC_DOMAIN,
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
