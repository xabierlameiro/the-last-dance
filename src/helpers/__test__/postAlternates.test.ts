import { getPostsByLocale } from '../fileReader';

/**
 * gsc-indexing-hygiene. `alternateLinks()` in `SEO/tags.tsx` emits the language cluster every post
 * carries, and it builds each sibling's URL as `/blog/<this post's category>/<sibling slug>` because
 * the frontmatter records the sibling's slug and not its path. That is only correct while every
 * locale of a post agrees on its category — an assumption nothing stated until now.
 *
 * `legacyFacetRedirects` throws at build time when two locales of the *same slug* disagree, which is
 * a narrower guarantee: alternates are different slugs by design. This is the assumption stated
 * directly, so a post translated into a different category fails here rather than silently emitting
 * an hreflang to a URL that 308s away.
 */
const posts = ['en', 'es', 'gl'].flatMap((locale) => getPostsByLocale(locale));
const byLocaleAndSlug = new Map(posts.map(({ meta }) => [`${meta.locale}:${meta.slug}`, meta]));

describe('post alternates', () => {
    it('resolves every declared alternate to a real post', () => {
        const missing = posts.flatMap(({ meta }) =>
            (meta.alternate ?? [])
                .filter(({ lang, url }: { lang: string; url: string }) => !byLocaleAndSlug.has(`${lang}:${url}`))
                .map(({ lang, url }: { lang: string; url: string }) => `${meta.locale}:${meta.slug} -> ${lang}:${url}`)
        );

        expect(missing).toEqual([]);
    });

    /**
     * The page emits a self-referential hreflang and then one per `alternate`, so a frontmatter
     * entry naming the post's own locale would produce two `hreflang="es"` links on the same page.
     * Google discards an ambiguous annotation exactly like an unreciprocated one, so the whole
     * cluster would go with it.
     */
    it('never names the post its own alternate', () => {
        const selfReferential = posts.flatMap(({ meta }) =>
            (meta.alternate ?? [])
                .filter(({ lang }: { lang: string }) => lang === meta.locale)
                .map(() => `${meta.locale}:${meta.slug}`)
        );

        expect(selfReferential).toEqual([]);
    });

    it('keeps every locale of a post under the same category', () => {
        const mismatched = posts.flatMap(({ meta }) =>
            (meta.alternate ?? [])
                .map(({ lang, url }: { lang: string; url: string }) => byLocaleAndSlug.get(`${lang}:${url}`))
                .filter((sibling) => sibling && sibling.category.toLowerCase() !== meta.category.toLowerCase())
                .map((sibling) => `${meta.slug} (${meta.category}) vs ${sibling.slug} (${sibling.category})`)
        );

        expect(mismatched).toEqual([]);
    });

    // hreflang is reciprocal: a post naming a sibling must be named back by it.
    it('is declared in both directions', () => {
        const unreciprocated = posts.flatMap(({ meta }) =>
            (meta.alternate ?? [])
                .map(({ lang, url }: { lang: string; url: string }) => byLocaleAndSlug.get(`${lang}:${url}`))
                .filter(
                    (sibling) =>
                        sibling &&
                        !(sibling.alternate ?? []).some(
                            ({ lang, url }: { lang: string; url: string }) =>
                                lang === meta.locale && url === meta.slug
                        )
                )
                .map((sibling) => `${sibling.locale}:${sibling.slug} does not name ${meta.locale}:${meta.slug}`)
        );

        expect(unreciprocated).toEqual([]);
    });
});
