import React from 'react';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SidesShift from '@/components/SidesShift';
import { getPostBySlug, getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
import { author } from '@/constants/site';
import { useRouter } from 'next/router';
import useSideShift from '@/hooks/useSideShift';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
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

const PostPage = ({ post, tags, categories, posts }: Props) => {
    const { formatMessage: f, formatDate } = useIntl();
    const { open, dispatch } = useDialog();
    const { isMobile } = useWindowResize();
    const { left, onSideShiftLeft, right, onSideShiftRight } = useSideShift();
    const {
        query: { category, slug },
    } = useRouter();
    const close = () => dispatch({ type: 'close' });

    // Every MDX body opens with `# Title` immediately followed by <Date />, so a page-level
    // byline rendered above <MDXRemote> produced: author → title → date. Injecting it through
    // the h1 override lands it under the heading, where a byline belongs, without editing the
    // 42 MDX files. It stays server-rendered (the <Date /> component is ssr: false, so its
    // output never reaches a crawler) which is the point of the E-E-A-T byline in SDD-003.
    // UTC pins the calendar day: meta.date is a date-only ISO string, which parses as UTC
    // midnight and would format one day early in timezones behind UTC (same bug as #135).
    const postComponents = React.useMemo(() => {
        const byline = (
            <p className={styles.byline}>
                <Link href="/about">{post.meta.author ?? author}</Link>
                {post.meta.date ? (
                    <>
                        {' · '}
                        <time dateTime={post.meta.date}>
                            {formatDate(post.meta.date, {
                                timeZone: 'UTC',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </time>
                    </>
                ) : null}
            </p>
        );

        return {
            ...components,
            h1: (props: React.ComponentPropsWithoutRef<'h1'>) => (
                <>
                    <h1 {...props} />
                    {byline}
                </>
            ),
            // The byline carries the date now. The <Date /> tag stays in the MDX source because
            // extractPostDate parses it for datePublished and the sitemap lastmod.
            Date: () => null,
        };
    }, [formatDate, post.meta.author, post.meta.date]);

    let sideClass = '';
    if (left && !right) sideClass = styles.openPosts;
    else if (right) sideClass = styles.openCategories;

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
