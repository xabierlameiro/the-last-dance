import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import { Layout, Dialog, ControlButtons } from '@/components';
import {
    getPostBySlug,
    getAllPosts,
    getAllCategories,
    getPostsByLocaleAndCategory,
} from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { AsidePanel, ArticlePanel, NavList, PostList } from '@/components/Blog';
import styles from '@/styles/blog.module.css';

const PostPage = ({ post, tags, categories, posts }: any) => {
    const {
        query: { category, slug },
        asPath,
    } = useRouter();
    const { formatMessage: f } = useIntl();
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <Layout meta={{ ...post.meta, url: asPath }}>
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
                                <NavList
                                    title={f({ id: 'blog.categories' })}
                                    list={categories}
                                    category={category}
                                    isCategory
                                />
                                <NavList
                                    title={f({ id: 'blog.tags' })}
                                    list={tags}
                                    category={category}
                                />
                            </div>
                        </nav>
                        <nav className={styles.secondNav}>
                            <AsidePanel />
                            <div className={styles.postLinks}>
                                <PostList
                                    posts={posts}
                                    slug={slug}
                                    category={category}
                                />
                            </div>
                        </nav>
                        <article className={styles.article}>
                            <ArticlePanel post={post} />
                            <div className={styles.body}>
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
    const { categories, tags } = await getAllCategories(locale);
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
