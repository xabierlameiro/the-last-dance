import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import { Layout, Dialog, ControlButtons, SidesShift } from '@/components';
import { getPostBySlug, getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
import { useRouter } from 'next/router';
import useSideShift from '@/hooks/useSideShift';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import styles from '@/styles/blog.module.css';
import { clx } from '@/helpers';

type Props = {
    post: {
        meta: {
            title: string;
            description: string;
            slug: string;
            readTime: string;
            date: string;
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
    analytics: any;
};

const PostPage = ({ post, tags, categories, posts, analytics }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });
    const { left, onSideShiftLeft, right, onSideShiftRight } = useSideShift();
    const {
        query: { category, slug },
    } = useRouter();

    return (
        <Layout meta={{ ...post.meta }} isBlog>
            <Dialog
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
                            <ArticlePanel readTime={post.meta.readTime} analytics={analytics} />
                            <div className={styles.body}>
                                <MDXRemote {...post.content} components={components} />
                            </div>
                        </article>
                    </div>
                }
            ></Dialog>
        </Layout>
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
        params: { category, slug },
        locale,
    } = data;
    const post = await getPostBySlug(data);
    const mdxSource = await serialize(post.content);
    const { categories, tags } = await getAllCategories(locale);
    const posts = await getPostsByLocaleAndCategory(locale, category);
    const target = locale === 'en' ? `/blog/${category}/${slug}` : `/${locale}/blog/${category}/${slug}`;
    const { total } = await (await fetch(`${process.env.DOMAIN}/api/analytics?slug=${target}`)).json();

    return {
        props: {
            tags,
            categories,
            posts,
            analytics: total,
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
