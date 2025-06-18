import React from 'react';
import { getAllPosts } from '@/helpers/fileReader';
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
        const { lang, category, slug } = await params;
        
        // Buscar el post con más información
        const posts = getAllPosts();
        const post = posts.find(p => 
            p.meta.slug === slug && 
            p.meta.locale === lang && 
            p.meta.category.toLowerCase() === category.toLowerCase()
        );
        
        if (!post) {
            return {
                title: 'Blog Post Not Found',
                description: 'The requested blog post could not be found.',
            };
        }
        
        return {
            title: post.meta.title,
            description: post.meta.description,
            authors: [{ name: post.meta.author }],
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
        const { lang, category, slug } = await params;
        
        // Buscar el post con todos los parámetros
        const posts = getAllPosts();
        const post = posts.find(p => 
            p.meta.slug === slug && 
            p.meta.locale === lang && 
            p.meta.category.toLowerCase() === category.toLowerCase()
        );
        
        if (!post) {
            return (
                <Dialog
                    className="blog-post-error"
                    body={
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h1>Post not found</h1>
                            <p>The requested blog post could not be found.</p>
                            <p>Looking for: {lang}/{category}/{slug}</p>
                        </div>
                    }
                />
            );
        }
        
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
                        <h1>Error loading post</h1>
                        <p>An error occurred while loading the blog post.</p>
                        <pre style={{ fontSize: '12px', color: '#666' }}>
                            {error instanceof Error ? error.message : String(error)}
                        </pre>
                    </div>
                }
            />
        );
    }
}
