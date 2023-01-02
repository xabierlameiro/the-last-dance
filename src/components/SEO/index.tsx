import { useRouter } from 'next/router';
import { domain, author as auth } from '@/constants/site';
import { getLang, cleanTrailingSlash } from '@/helpers';
import Head from 'next/head';

type Props = {
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

const SEO = ({ meta, isBlog }: Props) => {
    const { locale: l, pathname: path } = useRouter();
    const category = meta?.category?.toLowerCase();
    const url = isBlog
        ? `${domain}${getLang(l)}/blog/${category}/${meta?.slug}`
        : `${domain}${getLang(l)}${cleanTrailingSlash(path)}`;
    const title = meta?.title;
    const author = meta?.author || auth;
    const description = meta?.description;
    const image = meta?.image;

    return (
        <Head>
            {isBlog ? (
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
                            image: [`${domain}/${image}`],
                            datePublished: new Date().toISOString(),
                            dateModified: new Date().toISOString(),
                            author: [
                                {
                                    '@type': 'Person',
                                    name: author,
                                    url: domain,
                                },
                            ],
                        }),
                    }}
                />
            ) : (
                <>
                    <link hrefLang="es" rel="alternate" href={`${domain}/es${cleanTrailingSlash(path)}`} />
                    <link hrefLang="gl" rel="alternate" href={`${domain}/gl${cleanTrailingSlash(path)}`} />
                </>
            )}

            <title>{title}</title>
            <meta name="author" content={author} />
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
            <meta property="og:title" content={title} />
            <meta name="twitter:title" content={title} />
            <meta name="image" content={image} />
            <meta property="og:image" itemProp="image" content={image} />
            <link rel="canonical" href={url} title="Canonical url" />
            {meta?.alternate?.map(({ lang, url }, index) => (
                <link
                    key={index}
                    rel="alternate"
                    href={`${domain}${getLang(lang)}/blog/${category}/${url}`}
                    hrefLang={lang}
                    title={`Alternate url for langueage ${lang}`}
                />
            ))}
        </Head>
    );
};

export default SEO;
