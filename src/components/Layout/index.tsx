import type { ReactElement } from 'react';
import Head from 'next/head';
import Dock from '@/components/Dock';
import BackgroundImage from '../BackgroundImage';

type Props = {
    children: ReactElement;
    meta?: {
        title: string;
        author?: string;
        description?: string;
        image?: string;
        url?: string;
    };
};

const Layout = ({ meta, children }: Props) => {
    return (
        <>
            <BackgroundImage />
            <Head>
                <title>{meta?.title}</title>
                <meta
                    name="author"
                    content={meta?.author || 'Xabier Lameiro Cardama'}
                />
                <meta name="description" content={meta?.description} />
                <meta property="og:description" content={meta?.description} />
                <meta name="twitter:description" content={meta?.description} />
                <meta property="og:title" content={meta?.title} />
                <meta name="twitter:title" content={meta?.title} />
                <meta name="image" content={meta?.image} />
                <meta property="og:image" content={meta?.image} />
                <link
                    rel="canonical"
                    href={`https://xabierlameiro.com${meta?.url ?? ''}`}
                />

                {/* <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            url: 'https://www.xabierlameiro.com',
                            name: 'Xabier Lameiro Cardama',
                            alternateName: 'xlameiro',
                        }),
                    }}
                />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BlogPosting',
                            mainEntityOfPage: {
                                '@type': 'WebPage',
                                '@id': 'https://www.xabierlameiro.com',
                            },
                            headline: meta?.title,
                            image: {
                                '@type': 'ImageObject',
                                url: meta?.image,
                            },
                            datePublished: '2021-01-01',
                            dateModified: '2021-01-01',
                        }),
                    }}
                /> */}
            </Head>
            <header data-testid="header"></header>
            <main data-testid="main"> {children}</main>
            <footer data-testid="footer"></footer>
            <Dock data-testid="nav" />
        </>
    );
};

export default Layout;
