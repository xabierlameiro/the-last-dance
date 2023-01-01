import styles from './post.module.css';
import Link from 'next/link';

const PostList = ({ posts, slug, category }: any) => {
    return (
        <ul>
            {posts.map((item: any, index: number) => (
                <li
                    key={index}
                    className={slug == item.meta.slug ? styles.selected : ''}
                >
                    <Link
                        href={`/blog/${category}/${item.meta.slug}`}
                        title={item.meta.title}
                    >
                        <div className={styles.title}>{item.meta.title}</div>
                        <div className={styles.excerpt}>
                            {item.meta.excerpt}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};
export default PostList;
