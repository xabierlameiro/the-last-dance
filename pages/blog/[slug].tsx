import { MDXRemote } from 'next-mdx-remote';
import { useDialog } from '@/context/dialog';
import { Layout, Dialog } from '@/components';
import { getPostBySlug, getAllPosts } from '@/helpers/fileReader';
import { components } from '@/helpers/mdxjs';
import { serialize } from '@/helpers/mdx';

const PostPage = ({ post }: any) => {
    const { open } = useDialog();

    return (
        <Layout meta={{ title: 'blog' }}>
            <Dialog
                modalMode
                open={open}
                body={<MDXRemote {...post.content} components={components} />}
            ></Dialog>
        </Layout>
    );
};

export const getStaticProps = async (params: any) => {
    const post = await getPostBySlug(params);
    const mdxSource = await serialize(post.content);

    return {
        props: {
            post: {
                ...post,
                content: mdxSource,
            },
        },
    };
};

export const getStaticPaths = async () => {
    const posts = await getAllPosts();
    return {
        paths: posts.map((post: any) => ({
            params: {
                slug: post.meta.slug,
            },
            locale: post.meta.locale,
        })),
        fallback: false,
    };
};

export default PostPage;
