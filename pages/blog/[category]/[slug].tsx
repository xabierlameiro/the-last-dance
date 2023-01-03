import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import { Layout, Dialog, ControlButtons, VisibilityManager } from '@/components';
import { getPostBySlug, getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { createSiteMap } from '@/helpers/fileWritter';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import styles from '@/styles/blog.module.css';
import { TfiMinus } from 'react-icons/tfi';
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
};

const PostPage = ({ post, tags, categories, posts }: Props) => {
    const {
        query: { category, slug },
    } = useRouter();
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });
    // TODO: refactor this
    const [big, setBig] = React.useState(false);
    const [big2, setBig2] = React.useState(false);

    const handleClick = () => {
        setBig((big) => !big);
    };

    // handler for left and right swipe
    const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
        const { clientX } = e.touches[0];
        const { clientWidth } = e.currentTarget;
        if (clientX < clientWidth / 2) {
            setBig(true);
        } else {
            setBig(false);
        }
    };

    // second handler for left and right swipe
    const handleSwipe2 = (e: React.TouchEvent<HTMLDivElement>) => {
        const { clientX } = e.touches[0];
        const { clientWidth } = e.currentTarget;
        if (clientX < clientWidth / 2) {
            setBig2(true);
        } else {
            setBig2(false);
        }
    };

    return (
        <Layout meta={{ ...post.meta }} isBlog>
            <Dialog
                open={open}
                body={
                    <div
                        className={clx(styles.container, big && !big2 ? styles.big : big2 ? styles.big2 : '')}
                        onTouchStart={handleSwipe}
                    >
                        <nav className={styles.nav} onTouchStart={handleSwipe2}>
                            <ControlButtons onClickClose={close} onClickMinimise={close} />
                            <div>
                                <NavList
                                    title={f({ id: 'blog.categories' })}
                                    list={categories}
                                    category={category}
                                    isCategory
                                />
                                <NavList title={f({ id: 'blog.tags' })} list={tags} category={category} />
                            </div>
                        </nav>
                        <nav className={styles.secondNav} onTouchStart={handleSwipe2}>
                            <AsidePanel />
                            <div className={styles.postLinks}>
                                <PostList posts={posts} slug={slug} category={category} />
                            </div>
                            <TfiMinus
                                className={clx(styles.swap, styles.left)}
                                onClick={handleClick}
                                onDrag={handleClick}
                            />
                            <TfiMinus className={styles.swap} onClick={handleClick} onDrag={handleClick} />
                        </nav>
                        <article className={styles.article}>
                            <ArticlePanel readTime={post.meta.readTime} />
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
        fallback: false,
    };
};

export default PostPage;
