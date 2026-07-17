import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { getPostsByLocale } from '@/helpers/fileReader';
import styles from '@/styles/blogIndex.module.css';

type PostSummary = {
    title: string;
    excerpt: string;
    slug: string;
    category: string;
    date: string | null;
};

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
                        <ul className={styles.posts}>
                            {posts.map((post) => (
                                <li key={post.slug} className={styles.post}>
                                    <Link href={`/blog/${post.category.toLowerCase()}/${post.slug}`}>
                                        <h2>{post.title}</h2>
                                    </Link>
                                    {post.date && <span className={styles.date}>{post.date}</span>}
                                    <p>{post.excerpt}</p>
                                </li>
                            ))}
                        </ul>
                        <p className={styles.links}>
                            <Link href="/about">{f({ id: 'about.title' })}</Link>
                            {' · '}
                            <Link href="/contact">{f({ id: 'contact.title' })}</Link>
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
