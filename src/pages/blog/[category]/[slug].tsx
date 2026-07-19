import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SidesShift from '@/components/SidesShift';
import { getPostBySlug, getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
import { useRouter } from 'next/router';
import useSideShift from '@/hooks/useSideShift';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import usePostComponents from '@/components/Blog/PostByline';
import Loading from '@/components/RenderManager/Loading';
import styles from '@/styles/blog.module.css';
import { clx } from '@/helpers';
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
    const { left, onSideShiftLeft, right, onSideShiftRight } = useSideShift();
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
                        <nav className={styles.nav} onTouchStart={onSideShiftRight}>
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
                        <nav className={styles.secondNav} onTouchStart={onSideShiftRight}>
                            <AsidePanel />
                            <div className={styles.postLinks}>
                                <PostList posts={posts} slug={slug} category={category} />
                            </div>
                            <SidesShift leftPosition />
                            <SidesShift />
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
        post = getPostBySlug(data);
    } catch {
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
    const posts = getPostsByLocaleAndCategory(locale, category);

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
    createSiteMap(
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
