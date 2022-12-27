import { MDXRemote } from 'next-mdx-remote';
import { getPostBySlug, getAllPosts } from '@/helpers/fileReader';
import { serialize } from 'next-mdx-remote/serialize';

const PostPage = ({ post }: any) => {
    return (
        <div>
            <MDXRemote {...post.content} />
        </div>
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
