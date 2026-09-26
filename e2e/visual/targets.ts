/**
 * @description The screens the visual suite captures, and the constants their URLs are built from.
 *
 * Everything here is pinned on purpose. A target derived from "the newest post" would move every
 * time something is published, and a baseline that moves on its own cannot tell an upgrade's
 * regression apart from an ordinary Tuesday.
 */

export const LOCALES = ['en', 'es', 'gl'] as const;

export type Locale = (typeof LOCALES)[number];

/** `en` is `i18n.defaultLocale` and serves unprefixed; the other two carry their prefix. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * 375 is below every `max-width` breakpoint in `src/**` (the widest is 1543, the narrowest 420),
 * so one mobile capture exercises all 15 of them. The only two `min-width` queries, 768 and 1024,
 * are already satisfied by the 1280 desktop captures — between the two widths every media query in
 * the stylesheets is entered at least once.
 */
export const MOBILE_VIEWPORT = { width: 375, height: 812 } as const;

export const DESKTOP_VIEWPORT = { width: 1280, height: 720 } as const;

/**
 * The pinned post. `make-a-views-counter` renders a Code Hike block, which is the payload most
 * exposed to a bundler change, and exists in all three locales.
 *
 * Its slug is translated per locale — `getStaticPaths` builds the URL from the front matter's own
 * `slug`, not from the directory name — so a post target is three URLs, not one.
 */
const POST_SLUG_BY_LOCALE: Record<Locale, string> = {
    en: 'make-a-views-counter-with-google-analytics',
    es: 'hacer-un-contador-de-vistas-con-google-analytics',
    gl: 'facer-un-contador-de-vistas-con-google-analytics',
};

/** `getStaticPaths` lowercases `meta.category`; the front matter says `Nextjs`. */
const POST_CATEGORY = 'nextjs';

/** From the pinned post's own `tags`, so the facet URL resolves to a tag it actually carries. */
const POST_TAG = 'node';

/** `data/legal/` is not localised: one slug serves all three languages. */
const LEGAL_SLUG = 'privacy-policy';

export type CaptureTarget = {
    /** Stable identifier; it becomes part of the screenshot filename, so it never changes casually. */
    readonly name: string;
    /**
     * The route file this target covers, relative to `src/pages` and without its extension. It is
     * what lets `coverage.test.ts` compare the target list against the page tree mechanically
     * instead of trusting that someone remembered to add a row.
     */
    readonly route: string;
    /** Path without the locale prefix, which `localisedPath` adds. */
    readonly path: (locale: Locale) => string;
};

/**
 * The 11 screens that render markup.
 *
 * `/blog` and `/blog/<category>` are deliberately absent: both are `() => null` components whose
 * `getServerSideProps` redirects to the newest post, so there is nothing to photograph and what
 * they point at changes with publishing. They are covered by REDIRECT_TARGETS instead.
 */
export const CAPTURE_TARGETS: readonly CaptureTarget[] = [
    { name: 'home', route: 'index', path: () => '/' },
    {
        name: 'post',
        route: 'blog/[category]/[slug]',
        path: (locale) => `/blog/${POST_CATEGORY}/${POST_SLUG_BY_LOCALE[locale]}`,
    },
    {
        name: 'post-tag-facet',
        route: 'blog/[category]/[slug]',
        path: (locale) => `/blog/${POST_CATEGORY}/${POST_SLUG_BY_LOCALE[locale]}?tag=${POST_TAG}`,
    },
    { name: 'comments', route: 'comments', path: () => '/comments' },
    { name: 'legal', route: 'legal/[slug]', path: () => `/legal/${LEGAL_SLUG}` },
    { name: 'settings', route: 'settings', path: () => '/settings' },
    { name: 'survey', route: 'survey', path: () => '/survey' },
    { name: 'next-coverage', route: 'next-coverage', path: () => '/next-coverage' },
    { name: 'next-leak', route: 'next-leak', path: () => '/next-leak' },
    { name: 'not-found', route: '404', path: () => '/404' },
    { name: 'server-error', route: '500', path: () => '/500' },
] as const;

export type RedirectTarget = {
    readonly name: string;
    readonly path: string;
    /**
     * The shape the `Location` header must match. Asserting a shape rather than a fixed URL is the
     * point: the destination is whichever post is newest, and pinning it would break on publish.
     */
    readonly destination: (locale: Locale) => RegExp;
};

export const REDIRECT_TARGETS: readonly RedirectTarget[] = [
    {
        name: 'blog-index',
        path: '/blog',
        destination: (locale) =>
            new RegExp(`^${localePrefix(locale)}/blog/[a-z0-9-]+/[a-z0-9-]+$`),
    },
    {
        name: 'blog-category',
        path: `/blog/${POST_CATEGORY}`,
        destination: (locale) =>
            new RegExp(`^${localePrefix(locale)}/blog/[a-z0-9-]+/[a-z0-9-]+$`),
    },
] as const;

/** `''` for the default locale, `/es` or `/gl` otherwise. */
export function localePrefix(locale: Locale): string {
    return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

export function localisedPath(locale: Locale, path: string): string {
    return `${localePrefix(locale)}${path}`;
}

/**
 * Route files under `src/pages` that render nothing, so the derived-coverage check in
 * `coverage.test.ts` can account for them instead of reporting them as missing baselines.
 */
export const NON_RENDERING_ROUTES: readonly string[] = ['blog/index', 'blog/[category]/index'] as const;
