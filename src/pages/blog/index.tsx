import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { getPostsByLocale } from '@/helpers/fileReader';
import PostSummaryList, { type PostSummary } from '@/components/Blog/PostSummaryList';
import styles from '@/styles/blogIndex.module.css';

type CategorySummary = {
    category: string;
    total: number;
};

type Props = {
    posts: PostSummary[];
    categories: CategorySummary[];
};

/**
 * @description Blog hub page (SDD-002 D3): crawlable index of every post and
 * category with internal links — /blog used to redirect to the home page.
 */
const BlogIndex = ({ posts, categories }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'blog.index.seo.title' }),
                    description: f({ id: 'blog.index.seo.description' }),
                }}
            />
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={styles.container} data-testid="blog-index">
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <h1>{f({ id: 'blog.index.title' })}</h1>
                        <p className={styles.intro}>{f({ id: 'blog.index.intro' })}</p>
                        <nav className={styles.categories} aria-label={f({ id: 'blog.categories' })}>
                            {categories.map(({ category, total }) => (
                                <Link
                                    key={category}
                                    href={`/blog/${category.toLowerCase()}`}
                                    className={styles.category}
                                >
                                    {`${category} (${total})`}
                                </Link>
                            ))}
                        </nav>
                        <PostSummaryList posts={posts} />
                        <p className={styles.links}>
                            {/* /about and /contact are gone — the home is the entity page */}
                            <Link href="/">{f({ id: 'about.title' })}</Link>
                        </p>
                    </div>
                }
            />
        </>
    );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
    const posts = getPostsByLocale(locale)
        .map(({ meta }) => ({
            title: meta.title,
            excerpt: meta.excerpt ?? '',
            slug: meta.slug,
            category: meta.category,
            date: meta.date,
        }))
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    const categories = [...new Set(posts.map((post) => post.category))].map((category) => ({
        category,
        total: posts.filter((post) => post.category === category).length,
    }));

    return {
        props: {
            posts,
            categories,
        },
    };
};

export default BlogIndex;
