import styles from './post.module.css';
import Link from 'next/link';

type PostListItem = {
    meta: {
        title: string;
        excerpt: string;
        slug: string;
        /**
         * The post's own primary category. The href is built from this rather than from the route's
         * `category` param on purpose: on a tag URL the param is the tag, so linking through it
         * produced a faceted duplicate for every post in the list, out-linking the canonical the page
         * declares. Google picked one of those facets over the canonical (SDD-009 rules out a 301
         * here, and a canonical must not be paired with noindex), so the links agree with the
         * canonical instead.
         */
        category: string;
    };
};

type Props = {
    posts?: PostListItem[];
    slug?: string | string[];
};
/**
 * @example
 *     <PostList posts={posts} slug={slug} />;
 *
 * @param {object[]} posts - The list of posts
 * @param {string} slug - The slug is used to highlight the selected post
 * @returns {JSX.Element}
 */
const PostList = ({ posts, slug }: Props) => {
    if (!posts) return null;

    if (slug && typeof slug == 'object') slug = slug[0];

    return (
        <ul data-testid="post-list" className={styles.list}>
            {posts.map((item: PostListItem, index: number) => (
                <li key={index} className={slug == item.meta.slug ? styles.selected : ''}>
                    <Link href={`/blog/${item.meta.category}/${item.meta.slug}`} title={item.meta.title}>
                        <div className={styles.title}>{item.meta.title}</div>
                        <div className={styles.excerpt}>{item.meta.excerpt}</div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};
export default PostList;
