import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import SEO from '@/components/SEO';
import { useDialog } from '@/context/dialog';
import { getAllPosts, getPostsByLocaleAndTag } from '@/helpers/fileReader';
import PostSummaryList, { type PostSummary } from '@/components/Blog/PostSummaryList';
import styles from '@/styles/blogIndex.module.css';

type Props = {
    posts: PostSummary[];
    tagName: string;
    tagSlug: string;
};

/**
 * @description Tag hub page (SDD-009): lists every post carrying a tag with crawlable internal
 * links. Tags are their own self-canonical listing URLs (`/blog/tag/<tag>`) instead of colliding
 * with the canonical post URL space, which is what broke tag navigation before.
 */
const TagIndex = ({ posts, tagName, tagSlug }: Props) => {
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'blog.tag.seo.title' }, { tag: tagName }) as string,
                    description: f({ id: 'blog.tag.seo.description' }, { tag: tagName }) as string,
                    url: `/blog/tag/${tagSlug}`,
                }}
            />
            <Dialog
                large
                modalMode
                open={open}
                body={
                    <div className={styles.container} data-testid="tag-index">
                        <ControlButtons onClickClose={close} onClickMinimise={close} />
                        <h1>{tagName}</h1>
                        <p className={styles.intro}>{f({ id: 'blog.tag.intro' }, { tag: tagName })}</p>
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

export const getStaticProps = async ({ params, locale }: { params: { tag: string }; locale: string }) => {
    const { tag } = params;
    const taggedPosts = getPostsByLocaleAndTag(locale, tag);

    if (taggedPosts.length === 0) {
        return {
            notFound: true as const,
        };
    }

    // Preserve the tag's original casing from the frontmatter for display/SEO.
    const tagName =
        taggedPosts[0].meta.tags.find((postTag: string) => postTag.toLowerCase() === tag.toLowerCase()) ?? tag;
    const posts = taggedPosts
        .map(({ meta }) => ({
            title: meta.title,
            excerpt: meta.excerpt ?? '',
            slug: meta.slug,
            category: meta.category,
            date: meta.date,
        }))
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    return {
        props: {
            posts,
            tagName,
            tagSlug: tag.toLowerCase(),
        },
    };
};

export const getStaticPaths = async ({ locales }: { locales: string[] }) => {
    const posts = getAllPosts();
    const tags = [...new Set(posts.flatMap((post) => post.meta.tags.map((tag: string) => tag.toLowerCase())))];

    return {
        paths: locales.flatMap((locale) => tags.map((tag) => ({ params: { tag }, locale }))),
        fallback: 'blocking',
    };
};

export default TagIndex;
