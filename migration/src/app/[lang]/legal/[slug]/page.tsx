import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '../../dictionaries';
import LegalContent from './legal-content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from '@/helpers/mdx';

const LEGAL_PATH = path.join(process.cwd(), 'data/legal');

type Props = {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
};

// Generate static paths for legal pages
export async function generateStaticParams(): Promise<{
    lang: string;
    slug: string;
}[]> {
    const slugs = ['cookies-policy', 'legal-notice', 'privacy-policy'];
    const langs = ['es', 'en', 'gl'];
    
    const params: { lang: string; slug: string }[] = [];
    
    for (const lang of langs) {
        for (const slug of slugs) {
            params.push({ lang, slug });
        }
    }
    
    return params;
}

// Generate metadata for each legal page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug, lang } = await params;
        const dict = await getDictionary(lang);
        const fullPath = path.join(LEGAL_PATH, `${slug}.mdx`);
        
        if (fs.existsSync(fullPath)) {
            const mdx = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(mdx);
            
            return {
                title: data.title || `${dict.legal.title} - ${dict.seo.title}`,
                description: data.description || dict.legal.title,
                robots: data.noindex ? { index: false, follow: false } : undefined,
            };
        }
        
        return {
            title: `${dict.legal.title} - ${dict.seo.title}`,
            description: dict.legal.title,
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Legal',
            description: 'Legal documentation',
        };
    }
}

// Server Component for the legal page
export default async function LegalPage({ params }: Props) {
    try {
        const { lang, slug } = await params;
        const dict = await getDictionary(lang);
        const fullPath = path.join(LEGAL_PATH, `${slug}.mdx`);
        
        if (!fs.existsSync(fullPath)) {
            return (
                <div>
                    <h1>Legal document not found</h1>
                    <p>The requested legal document could not be found.</p>
                </div>
            );
        }
        
        const mdx = fs.readFileSync(fullPath, 'utf8');
        const { content, data } = matter(mdx);
        const mdxSource = await serialize(content);
        
        return <LegalContent source={mdxSource} meta={data} dict={dict} slug={slug} />;
    } catch (error) {
        console.error('Error rendering legal page:', error);
        return (
            <div>
                <h1>Error</h1>
                <p>An error occurred while loading the legal document.</p>
            </div>
        );
    }
}
