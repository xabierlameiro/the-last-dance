import { useRouter } from 'next/router';
import React from 'react';
import { author as auth } from '@/constants/site';
import { getLang, cleanTrailingSlash, jsonLdString } from '@/helpers';
import Head from 'next/head';

type Props = {
    isBlog?: boolean;
    noimage?: boolean;
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
        date?: string | null;
        updated?: string | null;
        faq?: Array<{ question: string; answer: string }> | null;
    };
};

const OG_LOCALES: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    gl: 'gl_ES',
};

/**
 * @example
 *     <SEO meta={meta} isBlog={true} />;
 *
 * @param {object} meta - The object containing the meta data for SEO
 * @param {boolean} isBlog - Whether the page is a blog post the SEO changes
 * @param {boolean} noimage - Whether to show the image in the SEO
 * @returns {JSX.Element}
 */
const SEO = ({ meta, isBlog, noimage = true }: Props) => {
    const { locale: l, pathname: path } = useRouter();
    const category = meta?.category?.toLowerCase();
    // meta.url lets dynamic non-blog routes (/legal/[slug], /blog/[category]) provide their
    // real path — router.pathname would leak the bracket placeholder into the canonical URL
    const pagePath = meta?.url ?? path;
    const url = isBlog
        ? `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}/blog/${category}/${meta?.slug}`
        : `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}${cleanTrailingSlash(pagePath)}`;
    const title = meta?.title;
    const author = meta?.author || auth;
    const description = meta?.description;
    const image = meta?.image ?? '/og-home.jpg';
    const imageUrl = `${process.env.NEXT_PUBLIC_DOMAIN}${image.startsWith('/') ? '' : '/'}${image}`;
    const date = meta?.date;
    // For blog posts, the English version is either the current page or listed in the alternates
    const englishAlternate = meta?.alternate?.find(({ lang }) => lang === 'en');
    const englishAlternateUrl = englishAlternate
        ? `${process.env.NEXT_PUBLIC_DOMAIN}/blog/${category}/${englishAlternate.url}`
        : undefined;
    const defaultBlogUrl = l === 'en' ? url : englishAlternateUrl;

    return (
        <>
            <Head>
                {isBlog ? (
                    <>
                        <script
                            data-testid="json-ld"
                            type="application/ld+json"
                            key="item-jsonld"
                            // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                            dangerouslySetInnerHTML={{
                                __html: jsonLdString({
                                    '@context': 'https://schema.org',
                                    '@type': 'Article',
                                    headline: title,
                                    description,
                                    url,
                                    inLanguage: l,
                                    ...(image && { image: [imageUrl] }),
                                    ...(date && { datePublished: date, dateModified: meta?.updated ?? date }),
                                    author: [
                                        {
                                            '@type': 'Person',
                                            '@id': `${process.env.NEXT_PUBLIC_DOMAIN}/#person`,
                                            name: author,
                                            url: process.env.NEXT_PUBLIC_DOMAIN,
                                        },
                                    ],
                                    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
                                }),
                            }}
                        />
                        <script
                            data-testid="breadcrumb-jsonld"
                            type="application/ld+json"
                            key="breadcrumb-jsonld"
                            // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                            dangerouslySetInnerHTML={{
                                __html: jsonLdString({
                                    '@context': 'https://schema.org',
                                    '@type': 'BreadcrumbList',
                                    itemListElement: [
                                        {
                                            '@type': 'ListItem',
                                            position: 1,
                                            name: 'Home',
                                            item: `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}`,
                                        },
                                        {
                                            '@type': 'ListItem',
                                            position: 2,
                                            name: 'Blog',
                                            item: `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}/blog`,
                                        },
                                        {
                                            '@type': 'ListItem',
                                            position: 3,
                                            name: meta?.category,
                                            item: `${process.env.NEXT_PUBLIC_DOMAIN}${getLang(l)}/blog/${category}`,
                                        },
                                        { '@type': 'ListItem', position: 4, name: title, item: url },
                                    ],
                                }),
                            }}
                        />
                        {meta?.faq && meta.faq.length > 0 && (
                            <script
                                data-testid="faq-jsonld"
                                type="application/ld+json"
                                key="faq-jsonld"
                                // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
                                dangerouslySetInnerHTML={{
                                    __html: jsonLdString({
                                        '@context': 'https://schema.org',
                                        '@type': 'FAQPage',
                                        mainEntity: meta.faq.map(({ question, answer }) => ({
                                            '@type': 'Question',
                                            name: question,
                                            acceptedAnswer: {
                                                '@type': 'Answer',
                                                text: answer,
                                            },
                                        })),
                                    }),
                                }}
                            />
                        )}
                        {l && <link rel="alternate" hrefLang={l} href={url} />}
                        {defaultBlogUrl && <link rel="alternate" hrefLang="x-default" href={defaultBlogUrl} />}
                    </>
                ) : (
                    <>
                        <link
                            hrefLang="en"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}${cleanTrailingSlash(pagePath)}`}
                        />
                        <link
                            hrefLang="es"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}/es${cleanTrailingSlash(pagePath)}`}
                        />
                        <link
                            hrefLang="gl"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}/gl${cleanTrailingSlash(pagePath)}`}
                        />
                        <link
                            hrefLang="x-default"
                            rel="alternate"
                            href={`${process.env.NEXT_PUBLIC_DOMAIN}${cleanTrailingSlash(pagePath)}`}
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
                <meta property="og:type" content={isBlog ? 'article' : 'website'} />
                {isBlog && date && <meta property="article:published_time" content={date} />}
                {isBlog && meta?.updated && <meta property="article:modified_time" content={meta.updated} />}
                {isBlog && meta?.category && <meta property="article:section" content={meta.category} />}
                {noimage && (
                    <>
                        <meta property="og:image" content={imageUrl} />
                        <meta name="twitter:image" content={imageUrl} />
                    </>
                )}
                <meta property="og:url" content={url} />
                <meta property="og:locale" content={OG_LOCALES[l ?? 'en'] ?? 'en_US'} />
                {/* og:locale alone tells a scraper which language THIS page is; the alternates
                    declare that the other translations exist. hreflang covers this for search
                    engines, but Open Graph consumers (LinkedIn, Facebook, Slack) do not read it. */}
                {Object.entries(OG_LOCALES)
                    .filter(([lang]) => lang !== (l ?? 'en'))
                    .map(([lang, ogLocale]) => (
                        <meta key={lang} property="og:locale:alternate" content={ogLocale} />
                    ))}
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
