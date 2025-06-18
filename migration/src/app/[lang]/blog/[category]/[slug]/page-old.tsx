import React from 'react';
import { getPostBySlug, getAllPosts } from '@/helpers/fileReader';
import type { Metadata } from 'next';
import { compileMDX } from 'next-mdx-remote/rsc';
import Dialog from '@/components/Dialog';
import { components } from '@/helpers/mdxjs';
import styles from '@/styles/blog.module.css';

type Props = {
    params: Promise<{ 
        lang: string; 
        category: string; 
        slug: string; 
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug } = await params;
        const post = getPostBySlug(slug);
        
        return {
            title: post.meta.title,
            description: post.meta.description,
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog Post',
            description: 'Blog post content',
        };
    }
}

export async function generateStaticParams() {
    try {
        const posts = getAllPosts();
        return posts.map((post) => ({
            lang: post.meta.locale,
            category: post.meta.category.toLowerCase(),
            slug: post.meta.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function BlogPostPage({ params }: Props) {
    try {
        const { slug } = await params;
        const post = getPostBySlug(slug);
        
        // Compilar el contenido MDX
        const { content } = await compileMDX({
            source: post.content,
            components,
            options: {
                parseFrontmatter: true,
            },
        });

        return (
            <Dialog
                className="blog-post"
                body={
                    <div className={styles.blogPost}>
                        <header className={styles.header}>
                            <h1>{post.meta.title}</h1>
                            <p>{post.meta.excerpt}</p>
                        </header>
                        <article className={styles.content}>
                            {content}
                        </article>
                    </div>
                }
            />
        );
    } catch (error) {
        console.error('Error rendering blog post:', error);
        return (
            <Dialog
                className="blog-post-error"
                body={
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h1>Post not found</h1>
                        <p>The requested blog post could not be found.</p>
                    </div>
                }
            />
        );
    }
}

// MDX Components with CodeHike v1
const mdxComponents = {
    h1: ({ children }: any) => (
        <h1 className="text-4xl font-bold mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="text-3xl font-semibold mb-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="text-2xl font-medium mb-2">{children}</h3>
    ),
    p: ({ children }: any) => (
        <p className="mb-4 leading-7">{children}</p>
    ),
    Code, // CodeHike v1 component
    CodeWithTabs, // CodeHike v1 component for tabs
};

type Props = {
    params: Promise<{
        lang: string;
        category: string;
        slug: string;
    }>;
};

// Generate static paths for blog posts
export async function generateStaticParams(): Promise<{
    lang: string;
    category: string;
    slug: string;
}[]> {
    try {
        const posts = getAllPosts();
        const params: { lang: string; category: string; slug: string }[] = [];
        
        for (const post of posts) {
            if (post?.meta?.slug && post?.meta?.category && post?.meta?.locale) {
                params.push({
                    lang: post.meta.locale,
                    category: post.meta.category.toLowerCase(),
                    slug: post.meta.slug,
                });
            }
        }
        
        return params;
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug } = await params;
        const post = getPostBySlug(slug);
        
        return {
            title: post?.meta?.title || 'Blog Post',
            description: post?.meta?.description || 'Blog post description',
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog Post',
            description: 'Blog post description',
        };
    }
}

// Server Component for the blog post page
export default async function BlogPostPage({ params }: Props) {
    try {
        const { lang, category, slug } = await params;
        
        // Fetch post data
        const post = getPostBySlug(slug);
        
        if (!post || !post.content) {
            return (
                <div>
                    <h1>Post not found</h1>
                    <p>The requested blog post could not be found.</p>
                </div>
            );
        }
        
        return (
            <div>
                <h1>{post.meta.title}</h1>
                <p>Category: {category}</p>
                <p>Language: {lang}</p>
                <div>
                    <pre>{post.content.slice(0, 500)}...</pre>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error rendering blog post:', error);
        return (
            <div>
                <h1>Error</h1>
                <p>An error occurred while loading the blog post.</p>
            </div>
        );
    }
}
