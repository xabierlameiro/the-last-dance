import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SidesShift from '@/components/SidesShift';
import { getPostBySlug, getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
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
import Script from 'next/script';

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

    return (
        <>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                crossOrigin="anonymous"
            />
            <SEO meta={{ ...post.meta }} isBlog />
            <Dialog
                modalMode={isMobile}
                open={open}
                body={
                    <div
                        className={clx(
                            styles.container,
                            left && !right ? styles.openPosts : right ? styles.openCategories : ''
                        )}
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
    const post = await getPostBySlug(data);
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
    const posts = await getAllPosts();

    const tags = posts.reduce(
        (
            acc: {
                params: {
                    category: string;
                    slug: string;
                };
                locale: string;
            }[],
            post: {
                meta: {
                    tags: string[];
                    slug: string;
                    locale: string;
                };
            }
        ) => {
            const paths = post.meta.tags.map((tag: string) => ({
                params: {
                    category: tag.toLowerCase(),
                    slug: post.meta.slug,
                },
                locale: post.meta.locale,
            }));
            return [...acc, ...paths];
        },
        []
    );

    const categories = posts.map(
        (post: {
            meta: {
                category: string;
                slug: string;
                locale: string;
            };
        }) => ({
            params: {
                category: post.meta.category.toLowerCase(),
                slug: post.meta.slug,
            },
            locale: post.meta.locale,
        })
    );

    createSiteMap([...tags, ...categories], locales);

    return {
        paths: [...tags, ...categories],
        fallback: 'blocking',
    };
};

export default PostPage;
