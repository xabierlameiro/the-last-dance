import React from 'react';
import { getAllPosts, getAllCategories, getPostsByLocaleAndCategory } from '@/helpers/fileReader';
import type { Metadata } from 'next';
import { compileMDX } from 'next-mdx-remote/rsc';
import { components } from '@/helpers/mdxjs';
import BlogPostClient from './BlogPostClient';

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
        
        const posts = getAllPosts();
        let post = posts.find(p => 
            p.meta.slug === slug && 
            p.meta.locale === lang && 
            p.meta.category.toLowerCase() === category.toLowerCase()
        );
        
        // Si no lo encontramos por categoría, buscamos por tag
        if (!post) {
            post = posts.find(p => 
                p.meta.slug === slug && 
                p.meta.locale === lang && 
                p.meta.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
            );
        }
        
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
            keywords: post.meta.tags,
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
        
        // Generar paths para categorías (como en legacy)
        const categories = posts.map((post) => ({
            lang: post.meta.locale,
            category: post.meta.category.toLowerCase(),
            slug: post.meta.slug,
        }));
        
        // Generar paths para tags (como en legacy)
        const tags = posts.reduce((acc: any[], post) => {
            const tagPaths = post.meta.tags.map((tag: string) => ({
                lang: post.meta.locale,
                category: tag.toLowerCase(), // El tag se mapea como "category" en la URL
                slug: post.meta.slug,
            }));
            return [...acc, ...tagPaths];
        }, []);
        
        // Combinar ambos (como en legacy)
        return [...categories, ...tags];
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function BlogPostPage({ params }: Props) {
    try {
        const { lang, category, slug } = await params;
        
        // Buscar el post específico (puede ser por categoría o tag)
        const posts = getAllPosts();
        let post = posts.find(p => 
            p.meta.slug === slug && 
            p.meta.locale === lang && 
            p.meta.category.toLowerCase() === category.toLowerCase()
        );
        
        // Si no lo encontramos por categoría, buscamos por tag
        if (!post) {
            post = posts.find(p => 
                p.meta.slug === slug && 
                p.meta.locale === lang && 
                p.meta.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
            );
        }
        
        if (!post) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>Post not found</h1>
                    <p>The requested blog post could not be found.</p>
                    <p>Looking for: {lang}/{category}/{slug}</p>
                </div>
            );
        }

        // Obtener categorías y tags
        const { categories, tags } = getAllCategories(lang);
        
        // Obtener posts de la misma categoría
        const postsInCategory = getPostsByLocaleAndCategory(lang, category);
        
        // Compilar el contenido MDX
        const { content } = await compileMDX({
            source: post.content,
            components,
            options: {
                parseFrontmatter: true,
            },
        });

        return (
            <BlogPostClient 
                post={post}
                categories={categories}
                tags={tags}
                postsInCategory={postsInCategory}
                content={content}
                category={category}
                slug={slug}
                locale={lang}
            />
        );
    } catch (error) {
        console.error('Error rendering blog post:', error);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Error loading post</h1>
                <p>An error occurred while loading the blog post.</p>
                <pre style={{ fontSize: '12px', color: '#666' }}>
                    {error instanceof Error ? error.message : String(error)}
                </pre>
            </div>
        );
    }
}
