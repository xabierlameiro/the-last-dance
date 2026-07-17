import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { getAllPosts, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import PostSummaryList, { type PostSummary } from '@/components/Blog/PostSummaryList';
import styles from '@/styles/blogIndex.module.css';

type Props = {
    posts: PostSummary[];
    categoryName: string;
    categorySlug: string;
};

/**
 * @description Category hub page (SDD-002 D3): lists every post in a category
 * with crawlable internal links and locale-aware SEO metadata.
 */
const CategoryIndex = ({ posts, categoryName, categorySlug }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'blog.category.seo.title' }, { category: categoryName }) as string,
                    description: f({ id: 'blog.category.seo.description' }, { category: categoryName }) as string,
                    url: `/blog/${categorySlug}`,
                }}
            />
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={styles.container} data-testid="category-index">
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <h1>{categoryName}</h1>
                        <p className={styles.intro}>{f({ id: 'blog.category.intro' }, { category: categoryName })}</p>
                        <PostSummaryList posts={posts} />
                        <p className={styles.links}>
                            <Link href="/blog">{f({ id: 'blog.index.title' })}</Link>
                        </p>
                    </div>
                }
            />
        </>
    );
};

export const getStaticProps = async ({ params, locale }: { params: { category: string }; locale: string }) => {
    const { category } = params;
    const posts = getPostsByLocaleAndCategory(locale, category).map(({ meta }) => ({
        title: meta.title,
        excerpt: meta.excerpt ?? '',
        slug: meta.slug,
        category: meta.category,
        date: meta.date,
    }));

    if (posts.length === 0) {
        return {
            notFound: true as const,
        };
    }

    return {
        props: {
            posts: [...posts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
            categoryName: posts[0].category,
            categorySlug: category.toLowerCase(),
        },
    };
};

export const getStaticPaths = async ({ locales }: { locales: string[] }) => {
    const posts = getAllPosts();
    const categories = [...new Set(posts.map((post) => post.meta.category.toLowerCase()))];

    return {
        paths: locales.flatMap((locale) =>
            categories.map((category) => ({
                params: { category },
                locale,
            }))
        ),
        fallback: 'blocking',
    };
};

export default CategoryIndex;
