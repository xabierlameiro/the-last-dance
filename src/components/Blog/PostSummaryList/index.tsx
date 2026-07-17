import React from 'react';
import Link from 'next/link';
import styles from '@/styles/blogIndex.module.css';

export type PostSummary = {
    title: string;
    excerpt: string;
    slug: string;
    category: string;
    date: string | null;
};

/**
 * @description Shared list of blog post summaries rendered by the blog hub and each
 * category hub. Always links to the canonical /blog/<category>/<slug> URL.
 *
 * @param {PostSummary[]} posts - Posts to list
 * @returns {JSX.Element}
 */
const PostSummaryList = ({ posts }: { posts: PostSummary[] }) => {
    return (
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
    );
};

export default PostSummaryList;
