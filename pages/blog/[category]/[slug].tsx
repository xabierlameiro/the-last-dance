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
declare global {
    interface Window {
        adsbygoogle: { [key: string]: unknown }[];
    }
}

const PostPage = ({ post, tags, categories, posts }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const { left, onSideShiftLeft, right, onSideShiftRight } = useSideShift();
    const {
        query: { category, slug },
    } = useRouter();
    const close = () => dispatch({ type: 'close' });

    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined' && typeof window.adsbygoogle !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.log(
                'Error while trying to load adsbygoogle. This is probably because you are not in production mode.'
            );
        }
    }, []);

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
                            <div className={styles.squareAd}>
                                <ins
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        minHeight: '100%',
                                        minWidth: '100%',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        margin: '0 auto',
                                        padding: '0',
                                        border: '0',
                                        overflow: 'hidden',
                                    }}
                                    className="adsbygoogle"
                                    data-ad-client="ca-pub-3537017956623483"
                                    data-ad-slot="4572463963"
                                    data-ad-format="auto"
                                    data-full-width-responsive="true"
                                />
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
                            <ArticlePanel readTime={post.meta.readTime} />
                            <div className={styles.body}>
                                <div className={styles.mdx}>
                                    <MDXRemote {...post.content} components={components} />
                                </div>
                                <div className={styles.verticalAd}>
                                    <ins
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '100%',
                                            minWidth: '100%',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            margin: '0 auto',
                                            padding: '0',
                                            border: '0',
                                            overflow: 'hidden',
                                        }}
                                        className="adsbygoogle"
                                        data-ad-client="ca-pub-3537017956623483"
                                        data-ad-slot="3253844563"
                                        data-ad-format="auto"
                                        data-full-width-responsive="true"
                                    />
                                </div>
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
        fallback: 'blocking',
    };
};

export default PostPage;
