import styles from './post.module.css';
import Link from 'next/link';

type Props = {
    posts?: {
        meta: {
            title: string;
            excerpt: string;
            slug: string;
        };
    }[];
    slug?: string | string[];
    category?: string | string[];
};

const PostList = ({ posts, slug, category }: Props) => {
    if (!posts) return null;

    if (slug && typeof slug == 'object') slug = slug[0];
    if (category && typeof category == 'object') category = category[0];

    return (
        <ul data-testid="post-list" className={styles.list}>
            {posts.map(
                (
                    item: {
                        meta: {
                            title: string;
                            excerpt: string;
                            slug: string;
                        };
                    },
                    index: number
                ) => (
                    <li key={index} className={slug == item.meta.slug ? styles.selected : ''}>
                        <Link href={`/blog/${category}/${item.meta.slug}`} title={item.meta.title}>
                            <div className={styles.title}>{item.meta.title}</div>
                            <div className={styles.excerpt}>{item.meta.excerpt}</div>
                        </Link>
                    </li>
                )
            )}
        </ul>
    );
};
export default PostList;
