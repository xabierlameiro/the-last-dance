import { useRouter } from 'next/router';
import { author as auth } from '@/constants/site';
import { getLang, cleanTrailingSlash } from '@/helpers';
import Notification from '@/components/Notification';
import Head from 'next/head';

type Props = {
    isBlog?: boolean;
    cookies?: boolean;
    meta?: {
        noindex?: boolean;
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

/**
 * @example
 *     <SEO meta={meta} isBlog={true} />;
 *
 * @param {object} meta - The object containing the meta data for SEO
 * @param {boolean} isBlog - Whether the page is a blog post the SEO changes
 * @returns {JSX.Element}
 */
const SEO = ({ meta, isBlog, cookies = true }: Props) => {
    const { locale: l, pathname: path } = useRouter();
    const category = meta?.category?.toLowerCase();
    const url = isBlog
        ? `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}/blog/${category}/${meta?.slug}`
        : `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}${cleanTrailingSlash(path)}`;
    const title = meta?.title;
    const author = meta?.author || auth;
    const description = meta?.description;
    const image = meta?.image ?? '/profile.png';

    return (
        <>
            {cookies && (
                <Notification
                    title="Cookies"
                    message="This website uses cookies to improve the user experience, more information on the legal information path."
                />
            )}
            <Head>
                {isBlog ? (
                    <script
                        data-testid="json-ld"
                        type="application/ld+json"
                        key="item-jsonld"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'Article',
                                headline: title,
                                description: description,
                                url: url,
                                image: [`${process.env.NEXT_PUBLIC_DOMAIN}/${image}`],
                                datePublished: new Date().toISOString(),
                                dateModified: new Date().toISOString(),
                                author: [
                                    {
                                        '@type': 'Person',
                                        name: author,
                                        url: process.env.NEXT_PUBLIC_DOMAIN,
                                    },
                                ],
                            }),
                        }}
                    />
                ) : (
                    <>
                        <link
                            hrefLang="es"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}/es${cleanTrailingSlash(path)}`}
                        />
                        <link
                            hrefLang="gl"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}/gl${cleanTrailingSlash(path)}`}
                        />
                    </>
                )}

                <title>{title}</title>
                {meta?.noindex ? (
                    <>
                        <meta name="robots" content="noindex" />
                        <meta name="googlebot" content="noindex" />
                    </>
                ) : (
                    <>
                        <meta name="robots" content="index,follow" />
                        <meta name="googlebot" content="index,follow" />
                    </>
                )}
                <meta name="author" content={author} />
                <meta name="description" content={description} />
                <meta property="og:description" content={description} />
                <meta name="twitter:description" content={description} />
                <meta property="og:title" content={title} />
                <meta name="twitter:title" content={title} />
                <meta name="image" content={image} />
                <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}${image}`} />
                <meta property="og:url" content={url} />
                <link rel="canonical" href={url} title="Canonical url" />
                {meta?.alternate?.map(({ lang, url }, index) => (
                    <link
                        data-testid="blog-alternate"
                        key={index}
                        rel="alternate"
                        href={`${process.env.NEXT_PUBLIC_DOMAIN}${getLang(lang)}/blog/${category}/${url}`}
                        hrefLang={lang}
                        title={`Alternate url for langueage ${lang}`}
                    />
                ))}
            </Head>
        </>
    );
};

export default SEO;
