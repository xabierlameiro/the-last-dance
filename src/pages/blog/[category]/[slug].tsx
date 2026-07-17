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
import { author, defaultLocale } from '@/constants/site';
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
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const { isMobile } = useWindowResize();
    const { left, onSideShiftLeft, right, onSideShiftRight } = useSideShift();
    const {
        query: { category, slug },
    } = useRouter();
    const close = () => dispatch({ type: 'close' });

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
                    <div
                        className={clx(styles.container, sideClass)}
                        onTouchStart={onSideShiftLeft}
                    >
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
                            <aside className={styles.navAd}>
                                <GoogleAdsense slot="2616692922" />
                            </aside>
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
                            <div className={styles.body}>
                                <div className={styles.mdx}>
                                    {/* E-E-A-T byline (SDD-003): author linked to the entity page */}
                                    <p className={styles.byline}>
                                        <Link href="/about">{post.meta.author ?? author}</Link>
                                        {post.meta.date ? ` · ${post.meta.date}` : ''}
                                    </p>
                                    <MDXRemote
                                        frontmatter={undefined}
                                        {...post.content}
                                        components={components}
                                        scope={{}}
                                    />
                                </div>
                                <aside className={styles.verticalAd}>
                                    <GoogleAdsense slot="2425121235" />
                                </aside>
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
        return {
            notFound: true as const,
            revalidate: 10,
        };
    }

    // Tag-based paths duplicate the canonical category URL — consolidate with a 301
    const canonicalCategory = post.meta.category.toLowerCase();
    if (category !== canonicalCategory) {
        const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
        return {
            redirect: {
                destination: `${localePrefix}/blog/${canonicalCategory}/${post.meta.slug}`,
                permanent: true,
            },
            revalidate: 10,
        };
    }

    // Tag-based URLs render normally so tag navigation stays selectable; the
    // <link rel="canonical"> (built from the post category in the SEO component)
    // consolidates the duplicate content for search engines.
    const mdxSource = await serialize(post.content);
    const { categories, tags } = await getAllCategories(locale);
    const posts = await getPostsByLocaleAndCategory(locale, category);

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
        revalidate: 10,
    };
};

export const getStaticPaths = async ({ locales }: { locales: string[] }) => {
    type PathPost = {
        meta: {
            category: string;
            slug: string;
            locale: string;
            date: string | null;
        };
    };
    const posts = await getAllPosts();

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
            date: post.meta.date,
        })),
        locales
    );

    return {
        paths: categories,
        fallback: 'blocking',
    };
};

export default PostPage;
