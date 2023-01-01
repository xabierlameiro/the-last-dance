import { Html, Head, Main, NextScript } from 'next/document';

const Document = (props: any) => {
    return (
        <Html lang={props.__NEXT_DATA__.locale}>
            <Head>
                <link rel="icon" href="/favicon.svg" />
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#FFF" />
                <meta
                    property="og:site_name"
                    content="Xabier Lameiro Cardama"
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content="https://www.xabierlameiro.com"
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@xlameiro" />
                <meta name="twitter:creator" content="@xlameiro" />
                <meta name="robots" content="all" />
                <meta name="googlebot" content="all" />
                <meta name="google" content="notranslate" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};
export default Document;
