import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import { Layout, Dialog, ControlButtons } from '@/components';
import {
    getPostBySlug,
    getAllPosts,
    getAllTags,
    getAllCategories,
    getPostsByLocaleAndCategory,
} from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { BsFolder2, BsTag } from 'react-icons/bs';
import { SlList, SlGrid } from 'react-icons/sl';
import { IoTrashOutline } from 'react-icons/io5';
import styles from '@/styles/blog.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

const PostPage = ({ post, tags, categories, posts, ...rest }: any) => {
    const {
        query: { category, slug },
    } = useRouter();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    const PostList = () => {
        return (
            <ul>
                {posts.map((item: any, index: number) => (
                    <li
                        key={index}
                        className={
                            slug == item.meta.slug ? styles.selected : ''
                        }
                    >
                        <Link href={`/blog/${category}/${item.meta.slug}`}>
                            <div className={styles.title}>
                                {item.meta.title}
                            </div>
                            <div className={styles.excerpt}>
                                {item.meta.excerpt}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    const CategoriesList = () => {
        return (
            <ul className={styles.postList}>
                {categories.map((item: any, index: number) => (
                    <li key={index}>
                        <Link
                            href={item.href}
                            className={
                                category == item.category.toLowerCase()
                                    ? styles.selected
                                    : ''
                            }
                        >
                            <BsFolder2 />
                            <div className={styles.tag}>{item.category}</div>
                            <div className={styles.number}>{item.total}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    const TagList = () => {
        return (
            <ul className={styles.postList}>
                {tags.map((item: any, index: number) => (
                    <li key={index}>
                        <Link
                            href={item.href}
                            className={
                                category == item.tag.toLowerCase()
                                    ? styles.selected
                                    : ''
                            }
                        >
                            <BsTag />
                            <div className={styles.tag}>{item.tag}</div>
                            <div className={styles.number}>{item.total}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };
    return (
        <Layout meta={{ title: 'blog' }}>
            <Dialog
                open={open}
                body={
                    <div className={styles.container}>
                        <nav className={styles.nav}>
                            <ControlButtons
                                onClickClose={close}
                                onClickMinimise={close}
                            />
                            <div>
                                <h2 className={styles.navTitle}>Topics</h2>
                                <CategoriesList />
                                <h2 className={styles.navTitle}>Tags</h2>
                                <TagList />
                            </div>
                        </nav>
                        <nav className={styles.secondNav}>
                            <div className={styles.controls}>
                                <SlList size={18} />
                                <SlGrid size={14} />
                                <IoTrashOutline size={19} />
                            </div>
                            <div className={styles.postLinks}>
                                <PostList />
                            </div>
                        </nav>
                        <article className={styles.article}>
                            <div className={styles.controls}>
                                <h1>hola</h1>
                            </div>
                            <div className={styles.postLinks}>
                                <MDXRemote
                                    {...post.content}
                                    components={components}
                                />
                            </div>
                        </article>
                    </div>
                }
            ></Dialog>
        </Layout>
    );
};

export const getStaticProps = async (data: any) => {
    const {
        params: { category },
        locale,
    } = data;
    const post = await getPostBySlug(data);
    const mdxSource = await serialize(post.content);
    const tags = await getAllTags(locale);
    const categories = await getAllCategories(locale);
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

export const getStaticPaths = async () => {
    const posts = await getAllPosts();

    const tags = posts.reduce((acc: any, post: any) => {
        const paths = post.meta.tags.map((tag: string) => ({
            params: {
                category: tag.toLowerCase(),
                slug: post.meta.slug,
            },
            locale: post.meta.locale,
        }));
        return [...acc, ...paths];
    }, []);

    const categories = posts.map((post: any) => ({
        params: {
            category: post.meta.category.toLowerCase(),
            slug: post.meta.slug,
        },
        locale: post.meta.locale,
    }));

    return {
        paths: [...tags, ...categories],
        fallback: false,
    };
};

export default PostPage;
