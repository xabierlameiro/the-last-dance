import { useRouter } from 'next/router';
import React from 'react';
import { author as auth } from '@/constants/site';
import Head from 'next/head';
import {
    alternateLinks,
    articleTags,
    blogTags,
    imageTags,
    jsonLdScript,
    ogLocaleTags,
    resolveSeoUrls,
    robotsTags,
    staticHreflangTags,
    type SeoMeta,
} from './tags';

export type JsonLdContext = { url: string; domain?: string; locale?: string; author: string };

type Props = {
    isBlog?: boolean;
    noimage?: boolean;
    meta?: SeoMeta;
    /**
     * Structured data for a page that is not a blog post, which otherwise emits none. A builder rather
     * than a value, so it is fed the same canonical URL the head tags use instead of recomputing it.
     */
    jsonLd?: (context: JsonLdContext) => unknown;
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
const SEO = ({ meta, isBlog, noimage = true, jsonLd }: Props) => {
    const { locale, pathname } = useRouter();
    const urls = resolveSeoUrls({ meta, isBlog, locale, pathname });
    const author = meta?.author || auth;
    const description = meta?.description;

    return (
        <Head>
            {isBlog ? blogTags({ meta, locale, author, urls }) : staticHreflangTags(urls.domain, urls.pagePath)}

            <title>{meta?.title}</title>
            {robotsTags(meta?.noindex)}
            <meta name="author" content={author} />
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
            <meta property="og:title" content={meta?.title} />
            <meta name="twitter:title" content={meta?.title} />
            <meta property="og:type" content={isBlog ? 'article' : 'website'} />
            {articleTags(isBlog, meta)}
            {imageTags(noimage, urls.imageUrl, meta?.title)}
            <meta property="og:url" content={urls.url} />
            {ogLocaleTags(locale)}
            <link rel="canonical" href={urls.url} title="Canonical url" />
            {alternateLinks(meta, urls.domain, urls.category)}
            {jsonLd &&
                jsonLdScript(
                    'page-jsonld',
                    'page-jsonld',
                    jsonLd({ url: urls.url, domain: urls.domain, locale, author }),
                )}
        </Head>
    );
};

export default SEO;
