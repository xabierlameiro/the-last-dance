import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SidesShift from '@/components/SidesShift';
import { getPostBySlug, getAllPosts, getAllCategories, findPostsByCategoryOrTag } from '@/helpers/fileReader';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
import { useRouter } from 'next/router';
import useSideShift from '@/hooks/useSideShift';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import usePostComponents from '@/components/Blog/PostByline';
import Loading from '@/components/RenderManager/Loading';
import styles from '@/styles/blog.module.css';
import { clx, getLang } from '@/helpers';
import dynamic from 'next/dynamic';
import useWindowResize from '@/hooks/useWindowResize';
import SEO from '@/components/SEO';

import { ADSENSE_ENABLED } from '@/components/GoogleAdsense';

const GoogleAdsense = dynamic(() => import('@/components/GoogleAdsense'), {
    loading: () => <Loading />,
    ssr: false,
});

type Props = {
    post: {
        meta: {
            title: string;
            description: string;
            slug: string;
            readTime: string;
            tags: string[];
            categories: string[];
            author?: string;
            date?: string | null;
        };
        content: {
            compiledSource: string;
        };
    };
    tags: {
        category: string;
        total: number;
        href: string;
        tag: string;
    }[];
    categories: {
        category: string;
        total: number;
        href: string;
        tag: string;
    }[];
    posts: {
        meta: {
            title: string;
            excerpt: string;
            slug: string;
            /** The post's own primary category, so its link is the canonical URL rather than the facet. */
            category: string;
        };
    }[];
};

/** @description Which side panel the swipe gesture has opened, if any. */
const resolveSideClass = (left: boolean, right: boolean) => {
    if (right) return styles.openCategories;
    if (left) return styles.openPosts;
    return '';
};

const PostPage = ({ post, tags, categories, posts }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const { isMobile } = useWindowResize();
    const { left, onSideShiftLeft, right, onSideShiftRight, toggleLeft, toggleRight } = useSideShift();
    const {
        query: { category, slug },
    } = useRouter();
    const close = () => dispatch({ type: 'close' });
    const postComponents = usePostComponents(post.meta);
    const sideClass = resolveSideClass(left, right);

    return (
        <>
            {/* AdSense temporarily hidden — the ads are not serving, so we skip
                loading the library. Restore alongside ADSENSE_ENABLED in GoogleAdsense. */}
            <SEO meta={{ ...post.meta }} isBlog />
            <Dialog
                modalMode={isMobile}
                open={open}
                body={
                    <div className={clx(styles.container, sideClass)} onTouchStart={onSideShiftLeft}>
                        <nav
                            className={styles.nav}
                            onTouchStart={onSideShiftRight}
                            aria-label={f({ id: 'nav.taxonomy' })}
                        >
                            <ControlButtons onClickClose={close} onClickMinimise={close} />
                            <div className={styles.navListContainer}>
                                <NavList
                                    title={f({ id: 'blog.categories' })}
                                    list={categories}
                                    category={category}
                                    isCategory
                                />
                                <NavList title={f({ id: 'blog.tags' })} list={tags} category={category} />
                            </div>
                            {ADSENSE_ENABLED && (
                                <aside className={styles.navAd}>
                                    <GoogleAdsense slot="2616692922" />
                                </aside>
                            )}
                        </nav>
                        <nav
                            className={styles.secondNav}
                            onTouchStart={onSideShiftRight}
                            aria-label={f({ id: 'nav.posts' })}
                        >
                            <AsidePanel />
                            <div className={styles.postLinks}>
                                <PostList posts={posts} slug={slug} />
                            </div>
                            {/* SDD-L05: these two rendered with no handleClick, so the only visible
                                affordance for the side panels did nothing and the real gesture was
                                touch-only. */}
                            <SidesShift
                                leftPosition
                                handleClick={toggleRight}
                                label={f({ id: 'blog.toggleCategories' })}
                                expanded={right}
                            />
                            <SidesShift
                                handleClick={toggleLeft}
                                label={f({ id: 'blog.togglePosts' })}
                                expanded={left}
                            />
                        </nav>
                        <article className={styles.article}>
                            <ArticlePanel readTime={post.meta.readTime} />
                            <div className={clx(styles.body, ADSENSE_ENABLED ? styles.withAd : '')}>
                                <div className={styles.mdx}>
                                    <MDXRemote
                                        frontmatter={undefined}
                                        {...post.content}
                                        components={postComponents}
                                        scope={{}}
                                    />
                                </div>
                                {ADSENSE_ENABLED && (
                                    <aside className={styles.verticalAd}>
                                        <GoogleAdsense slot="2425121235" />
                                    </aside>
                                )}
                            </div>
                        </article>
                    </div>
                }
            ></Dialog>
        </>
    );
};

/**
 * @description A 301 to the post's own canonical URL, for a slug requested under the wrong locale.
 *
 * SDD-L04 made `findPostBySlug` filter by locale, so a Spanish slug no longer answers under the
 * English prefix — it throws, and the page 404s. Right about the URL being wrong, wrong about what to
 * do next: those URLs had been indexed for months, so the 404 discards the equity they accumulated
 * and leaves Search Console reporting "No se ha encontrado" on pages still taking real traffic
 * (/blog/yarn/npm-token-solucion-erro: 43 impressions in 28 days into a dead end). The article did
 * not disappear, it lives one prefix over.
 *
 * So the slug is looked up again without the locale filter, and if it exists elsewhere the request is
 * redirected instead of dropped. The destination is built from the post's own frontmatter — never
 * from the request — so it is always the canonical URL, the same one `resolveSeoUrls` emits and the
 * sitemap submits. A slug that exists in no locale still 404s.
 *
 * Caveat worth knowing: two posts can legitimately share a slug across locales (the es and gl
 * `integracion-continua-con-github-actions-workflow` are spelled identically), and a locale-less
 * lookup returns whichever comes first in the corpus. Both are translations of the same article, so
 * either destination is a real page and the redirect is stable per build — it just is not meaningful
 * to ask which of the two is "the" target.
 */
const redirectToPostLocale = (params: { params: { category: string; slug: string } }) => {
    let post;
    try {
        post = getPostBySlug(params);
    } catch {
        return null;
    }

    const { locale: postLocale, category, slug } = post.meta ?? {};
    if (!postLocale || !category || !slug) return null;

    return {
        redirect: {
            destination: `${getLang(postLocale)}/blog/${category.toLowerCase()}/${slug}`,
            permanent: true,
        },
        // Same cadence as a rendered post: the mapping only changes when the content does.
        revalidate: 86400,
    } as const;
};

export const getStaticProps = async (data: {
    params: {
        category: string;
        slug: string;
    };
    locale: string;
}) => {
    const {
        params: { category },
        locale,
    } = data;

    // Unknown slugs must 404, not crash the render with a 500
    let post;
    try {
        post = getPostBySlug(data, locale);
    } catch {
        // Wrong locale rather than unknown slug? Send it to the real article instead of a dead end.
        const localeRedirect = redirectToPostLocale(data);
        if (localeRedirect) return localeRedirect;

        // Retry a missing slug within a minute (e.g. a just-added post), without hammering.
        return {
            notFound: true as const,
            revalidate: 60,
        };
    }

    // Faceted URLs: a post is intentionally reachable at one URL per category/tag it
    // carries (/blog/nextjs/<slug> AND /blog/css/<slug>). Each renders the post inside
    // the full-screen blog so the tag submenu keeps navigating between posts — no redirect.
    // The SEO <link rel="canonical"> (built from the post's primary category) consolidates
    // these duplicates for search engines, per Google's faceted-navigation guidance. A 301
    // here used to bounce tag clicks out of the blog, which broke tag navigation (SDD-009).
    const mdxSource = await serialize(post.content);
    const { categories, tags } = getAllCategories(locale);

    // SDD-L03. `findPostsByCategoryOrTag` returns whole parsed posts, raw `content` included, and
    // the sidebar list renders three fields. Measured on the built page for this route, 23,971 of the
    // 29,180 characters `posts` occupied were `content` nobody reads — 82%, shipped to every visitor
    // and growing linearly with the number of posts in a category. The `Props` type above already
    // declared only these three, so the type was honest and the payload was not.
    /*
     * `category` here is the *requested* segment, which for a tag URL is the tag, not the post's
     * category. PostList used to build every href from it, so browsing inside a tag minted a facet
     * URL for each post in the list — and those links sit in the sidebar of every page, which made
     * them the most-linked version of each post on the whole site. That is the signal Google weighs
     * against rel=canonical, and on /blog/testing/publish-report-testing-react it won: Search Console
     * reports Google picking the facet over the canonical the page itself declares.
     *
     * Google's guidance for this is rel=canonical plus *consistent* signals, and explicitly not
     * noindex (which must not be combined with a canonical, since it can carry over to the target)
     * and not a 301 here (SDD-009 — that bounced tag clicks out of the blog). So the fix is to stop
     * contradicting our own canonical: each post carries its own category and PostList links to that.
     * The facet URL still resolves 200 with the tag-filtered list, so entering a tag still works; what
     * goes away is minting a new facet URL on every click through that list.
     */
    const posts = findPostsByCategoryOrTag(locale, category).map(({ meta }) => ({
        meta: {
            title: meta.title,
            excerpt: meta.excerpt,
            slug: meta.slug,
            category: meta.category.toLowerCase(),
        },
    }));

    return {
        props: {
            tags,
            categories,
            posts,
            post: {
                ...post,
                content: mdxSource,
            },
        },
        // Content is static per deploy (git-based), so revalidate rarely instead of every 10s,
        // which used to re-run getStaticProps on a serverless function constantly.
        revalidate: 86400,
    };
};

export const getStaticPaths = async ({ locales }: { locales: string[] }) => {
    type PathPost = {
        meta: {
            category: string;
            slug: string;
            locale: string;
            date: string | null;
            updated: string | null;
        };
    };
    const posts = getAllPosts();

    const categories = posts.map((post: PathPost) => ({
        params: {
            category: post.meta.category.toLowerCase(),
            slug: post.meta.slug,
        },
        locale: post.meta.locale,
    }));

    // Only canonical (category) URLs are prerendered and submitted in the sitemap.
    // Tag-based URLs resolve on demand via fallback: 'blocking' and rely on the
    // SEO rel=canonical to consolidate the duplicate content.
    // The date travels separately from `paths` — Next.js rejects extra keys there.
    await createSiteMap(
        posts.map((post: PathPost) => ({
            params: {
                category: post.meta.category.toLowerCase(),
                slug: post.meta.slug,
            },
            locale: post.meta.locale,
            // lastmod: prefer the substantive-update date over the original publish date
            date: post.meta.updated ?? post.meta.date,
        })),
        locales
    );

    return {
        paths: categories,
        fallback: 'blocking',
    };
};

export default PostPage;
