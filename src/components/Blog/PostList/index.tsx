import styles from './post.module.css';
import Link from 'next/link';

type PostListItem = {
    meta: {
        title: string;
        excerpt: string;
        slug: string;
    };
};

type Props = {
    posts?: PostListItem[];
    slug?: string | string[];
    /**
     * The taxonomy segment currently being browsed — a category on a canonical URL, a tag on a
     * faceted one. Links are built from it so the segment survives a click, which is what keeps the
     * sidebar highlighting the tag you opened.
     *
     * #186 built these from each post's own category instead, to stop the tag listing minting a
     * faceted duplicate per post. It did stop that, and it also broke the feature: clicking a post
     * inside a tag listing moved the selection to that post's *category*, so the tag you were
     * browsing deselected itself and there was no way to walk a tag. Reverted — the duplicate URLs
     * were the price of this menu working, and the real fix is to stop carrying taxonomy in the path
     * at all rather than to make the links disagree with the page you are on.
     */
    category?: string | string[];
};
/**
 * @example
 *     <PostList posts={posts} slug={slug} category={category} />;
 *
 * @param {object[]} posts - The list of posts
 * @param {string} slug - The slug is used to highlight the selected post
 * @param {string} category - The taxonomy segment being browsed, preserved in every link
 * @returns {JSX.Element}
 */
const PostList = ({ posts, slug, category }: Props) => {
    if (!posts) return null;

    if (slug && typeof slug == 'object') slug = slug[0];
    if (category && typeof category == 'object') category = category[0];

    return (
        <ul data-testid="post-list" className={styles.list}>
            {posts.map((item: PostListItem, index: number) => (
                <li key={index} className={slug == item.meta.slug ? styles.selected : ''}>
                    <Link href={`/blog/${category}/${item.meta.slug}`} title={item.meta.title}>
                        <div className={styles.title}>{item.meta.title}</div>
                        <div className={styles.excerpt}>{item.meta.excerpt}</div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};
export default PostList;
