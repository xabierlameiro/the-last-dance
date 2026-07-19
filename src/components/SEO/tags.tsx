import React from 'react';
import { getLang, cleanTrailingSlash, jsonLdString } from '@/helpers';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from './jsonLd';

/**
 * Tag builders for <SEO />.
 *
 * These are plain functions returning arrays of elements, deliberately NOT React
 * components. `next/head` only picks up tags that are direct children, inside a
 * single React.Fragment, or in an array — a custom component renders server-side
 * and then vanishes on client-side navigation (vercel/next.js#8384). Arrays are
 * documented as supported, so this split is safe where a <MetaTags /> would not be.
 */

export type SeoMeta = {
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

export const OG_LOCALES: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    gl: 'gl_ES',
};

const jsonLdScript = (testId: string, key: string, payload: unknown) => (
    <script
        data-testid={testId}
        type="application/ld+json"
        key={key}
        // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here for JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: jsonLdString(payload) }}
    />
);

type UrlInput = { meta?: SeoMeta; isBlog?: boolean; locale?: string; pathname: string };

/**
 * @description Resolve the canonical URL and the derived values every tag group needs.
 * @returns {object} Canonical url, image url, category slug and the x-default blog url.
 */
export const resolveSeoUrls = ({ meta, isBlog, locale, pathname }: UrlInput) => {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const langPrefix = getLang(locale);
    const category = meta?.category?.toLowerCase();
    // meta.url lets dynamic non-blog routes (/legal/[slug], /blog/[category]) provide their
    // real path — router.pathname would leak the bracket placeholder into the canonical URL
    const pagePath = meta?.url ?? pathname;
    const url = isBlog
        ? `${domain}${langPrefix}/blog/${category}/${meta?.slug}`
        : `${domain}${langPrefix}${cleanTrailingSlash(pagePath)}`;

    const image = meta?.image ?? '/og-home.jpg';
    const imageUrl = `${domain}${image.startsWith('/') ? '' : '/'}${image}`;

    // For blog posts, the English version is either the current page or listed in the alternates
    const englishAlternate = meta?.alternate?.find(({ lang }) => lang === 'en');
    const englishAlternateUrl = englishAlternate
        ? `${domain}/blog/${category}/${englishAlternate.url}`
        : undefined;

    return {
        domain,
        langPrefix,
        category,
        pagePath,
        url,
        imageUrl,
        defaultBlogUrl: locale === 'en' ? url : englishAlternateUrl,
    };
};

type BlogTagsInput = {
    meta?: SeoMeta;
    locale?: string;
    author: string;
    urls: ReturnType<typeof resolveSeoUrls>;
};

/** @description Structured data and hreflang links for a blog post. */
export const blogTags = ({ meta, locale, author, urls }: BlogTagsInput) => {
    const { url, imageUrl, category, langPrefix, domain, defaultBlogUrl } = urls;

    const tags = [
        jsonLdScript(
            'json-ld',
            'item-jsonld',
            articleJsonLd({
                title: meta?.title,
                description: meta?.description,
                url,
                locale,
                imageUrl,
                date: meta?.date,
                updated: meta?.updated,
                author,
                domain,
            })
        ),
        jsonLdScript(
            'breadcrumb-jsonld',
            'breadcrumb-jsonld',
            breadcrumbJsonLd({
                title: meta?.title,
                url,
                category: meta?.category,
                categorySlug: category,
                langPrefix,
                domain,
            })
        ),
    ];

    if (meta?.faq && meta.faq.length > 0) {
        tags.push(jsonLdScript('faq-jsonld', 'faq-jsonld', faqJsonLd(meta.faq)));
    }
    if (locale) {
        tags.push(<link rel="alternate" hrefLang={locale} href={url} key="self-alternate" />);
    }
    if (defaultBlogUrl) {
        tags.push(<link rel="alternate" hrefLang="x-default" href={defaultBlogUrl} key="x-default" />);
    }

    return tags;
};

/** @description hreflang links for the static, non-blog pages. */
export const staticHreflangTags = (domain: string | undefined, pagePath: string) => {
    const path = cleanTrailingSlash(pagePath);
    return [
        <link hrefLang="en" rel="alternate" href={`${domain}${path}`} key="hreflang-en" />,
        <link hrefLang="es" rel="alternate" href={`${domain}/es${path}`} key="hreflang-es" />,
        <link hrefLang="gl" rel="alternate" href={`${domain}/gl${path}`} key="hreflang-gl" />,
        <link hrefLang="x-default" rel="alternate" href={`${domain}${path}`} key="hreflang-default" />,
    ];
};

export const robotsTags = (noindex?: boolean) => {
    const content = noindex ? 'noindex' : 'index,follow';
    return [
        <meta name="robots" content={content} key="robots" />,
        <meta name="googlebot" content={content} key="googlebot" />,
    ];
};

/** @description article:* metadata, emitted for blog posts only. */
export const articleTags = (isBlog: boolean | undefined, meta?: SeoMeta) => {
    if (!isBlog) return [];

    const tags = [];
    if (meta?.date) {
        tags.push(<meta property="article:published_time" content={meta.date} key="published" />);
    }
    if (meta?.updated) {
        tags.push(<meta property="article:modified_time" content={meta.updated} key="modified" />);
    }
    if (meta?.category) {
        tags.push(<meta property="article:section" content={meta.category} key="section" />);
    }
    return tags;
};

export const imageTags = (noimage: boolean, imageUrl: string) =>
    noimage
        ? [
              <meta property="og:image" content={imageUrl} key="og-image" />,
              <meta name="twitter:image" content={imageUrl} key="twitter-image" />,
          ]
        : [];

/**
 * @description og:locale alone tells a scraper which language THIS page is; the alternates
 * declare that the other translations exist. hreflang covers this for search engines, but
 * Open Graph consumers (LinkedIn, Facebook, Slack) do not read it.
 */
export const ogLocaleTags = (locale: string | undefined) => {
    const current = locale ?? 'en';
    return [
        <meta property="og:locale" content={OG_LOCALES[current] ?? 'en_US'} key="og-locale" />,
        ...Object.entries(OG_LOCALES)
            .filter(([lang]) => lang !== current)
            .map(([lang, ogLocale]) => (
                <meta property="og:locale:alternate" content={ogLocale} key={`og-locale-${lang}`} />
            )),
    ];
};

/** @description Translated URLs for the current blog post. */
export const alternateLinks = (meta: SeoMeta | undefined, domain: string | undefined, category?: string) =>
    (meta?.alternate ?? []).map(({ lang, url }) => (
        <link
            data-testid="blog-alternate"
            key={`alternate-${lang}`}
            rel="alternate"
            href={`${domain}${getLang(lang)}/blog/${category}/${url}`}
            hrefLang={lang}
            title={`Alternate url for langueage ${lang}`}
        />
    ));
