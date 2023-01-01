import type { ReactElement } from 'react';
import Head from 'next/head';
import Dock from '@/components/Dock';
import BackgroundImage from '../BackgroundImage';
import { useRouter } from 'next/router';
import { website_url } from '@/constants/site';
type Props = {
    children: ReactElement;
    meta?: {
        title: string;
        author?: string;
        description?: string;
        image?: string;
        url?: string;
        alternate?: Array<{ lang: string; url: string }>;
    };
};

const Layout = ({ meta, children }: Props) => {
    const { locale } = useRouter();
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
                    href={`${website_url}${
                        locale !== 'en' ? `/${locale}` : ''
                    }${meta?.url ?? ''}`}
                />
                {meta?.alternate?.map((alt, index) => (
                    <link
                        key={index}
                        rel="alternate"
                        href={`${website_url}${
                            alt.lang !== 'en' ? `/${alt.lang}` : ''
                        }/blog/${meta?.url
                            ?.split('/')
                            .filter((item) => item)
                            .slice(-2, -1)[0]
                            .replace(/-/g, ', ')}/${alt.url}`}
                        hrefLang={alt.lang}
                    />
                ))}
            </Head>
            <header data-testid="header"></header>
            <main data-testid="main"> {children}</main>
            <footer data-testid="footer"></footer>
            <Dock data-testid="nav" />
        </>
    );
};

export default Layout;
