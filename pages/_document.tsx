import { Html, Head, Main, NextScript } from 'next/document';

const Document = () => {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};
export default Document;
