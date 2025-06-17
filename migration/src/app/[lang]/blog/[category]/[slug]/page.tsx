import React from 'react';
import { getPostBySlug, getAllPosts } from '@/helpers/fileReader';
import type { Metadata } from 'next';

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
