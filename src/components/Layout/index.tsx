import type { ReactElement } from 'react';
import Head from 'next/head';
import Dock from '@/components/Dock';
import BackgroundImage from '../BackgroundImage';
import { useRouter } from 'next/router';
import { website_url, author as auth } from '@/constants/site';
import { isNotEng } from '@/helpers';

type Props = {
    children: ReactElement;
    isBlog?: boolean;
    meta?: {
        title: string;
        author?: string;
        description?: string;
        image?: string;
        category?: string;
        alternate?: Array<{ lang: string; url: string }>;
        slug?: string;
        url?: string;
    };
};

const Layout = ({ meta, children, isBlog }: Props) => {
    // TODO: Refactor this part, split this in other file

    const bla = useRouter();
    const { locale: l, pathname } = bla;
    const url = isBlog
        ? `${website_url}${
              isNotEng(l) ? `/${l}` : ''
          }/blog/${meta?.category?.toLowerCase()}/${meta?.slug}`
        : `${website_url}${isNotEng(l) ? `/${l}` : ''}${
              pathname !== '/' ? pathname : ''
          }`;
    const title = meta?.title;
    const author = meta?.author || auth;
    const description = meta?.description;
    const image = meta?.image;

    return (
        <>
            <BackgroundImage />
            <Head>
                {isBlog && (
                    <script
                        type="application/ld+json"
                        key="item-jsonld"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'Article',
                                headline: title,
                                description: description,
                                url: url,
                                image: [`${website_url}/${image}`],
                                datePublished: new Date().toISOString(),
                                dateModified: new Date().toISOString(),
                                author: [
                                    {
                                        '@type': 'Person',
                                        name: author,
                                        url: website_url,
                                    },
                                ],
                            }),
                        }}
                    />
                )}

                <title>{title}</title>
                <meta name="author" content={author} />
                <meta name="description" content={description} />
                <meta property="og:description" content={description} />
                <meta name="twitter:description" content={description} />
                <meta property="og:title" content={title} />
                <meta name="twitter:title" content={title} />
                <meta name="image" content={image} />
                <meta property="og:image" content={image} />
                <link rel="canonical" href={url} />
                {meta?.alternate?.map(({ lang, url }, index) => (
                    <link
                        key={index}
                        rel="alternate"
                        href={`${website_url}${
                            isNotEng(lang) ? `/${lang}` : ''
                        }/blog/${meta?.category?.toLowerCase()}/${url}`}
                        hrefLang={lang}
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
