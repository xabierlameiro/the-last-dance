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
    /**
     * The locale the content itself is written in, from post frontmatter. Distinct from the router
     * locale on purpose: `resolveSeoUrls` builds the canonical from this, so a page cannot declare
     * whatever prefix it happened to be requested under to be canonical (SDD-L04).
     */
    locale?: string;
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
    /**
     * SDD-L04: prefer the post's own locale over the router's.
     *
     * This used to be `getLang(locale)` unconditionally, so a page served under the wrong locale
     * prefix declared *that* prefix canonical — it self-canonicalised instead of pointing at the one
     * true URL. The locale guard in the post's getStaticProps now 404s that case, so this is
     * belt-and-braces; it is here because a canonical built from where the request happened to land,
     * rather than from what the content is, is wrong regardless of who else is guarding it.
     *
     * Non-blog pages have no `meta.locale`, so they keep using the router locale, which is correct
     * for them — the same path exists in all three.
     */
    const langPrefix = getLang(meta?.locale ?? locale);
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
    const englishAlternateUrl = englishAlternate ? `${domain}/blog/${category}/${englishAlternate.url}` : undefined;

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
    // SDD-L04: `max-image-preview:large` opts into large image thumbnails in Search and
    // Discover. Without it Google defaults to a small preview, which for a blog whose posts all
    // ship an OG image is leaving the image on the table. Only meaningful on indexable pages.
    const content = noindex ? 'noindex' : 'index,follow,max-image-preview:large';
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

/**
 * SDD-L04: dimensions and alt added alongside the URL. Without `og:image:width`/`height` a scraper
 * has to fetch the image before it can lay out a card, and some (LinkedIn in particular) fall back to
 * a small preview or no image rather than wait. Every OG image this site references is 1200x630 —
 * `og-home.jpg` and all 15 post images in `public/posts/` — so the values are accurate rather than
 * guessed. `og:image:alt` is the accessible description consumers read out.
 */
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

export const imageTags = (noimage: boolean, imageUrl: string, title?: string) =>
    noimage
        ? [
              <meta property="og:image" content={imageUrl} key="og-image" />,
              <meta property="og:image:width" content={OG_IMAGE_WIDTH} key="og-image-width" />,
              <meta property="og:image:height" content={OG_IMAGE_HEIGHT} key="og-image-height" />,
              ...(title ? [<meta property="og:image:alt" content={title} key="og-image-alt" />] : []),
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
