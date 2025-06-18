import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '../../dictionaries';
import LegalContent from './legal-content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

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
        
        // Buscar el archivo con el idioma específico primero, si no existe usar inglés como fallback
        const filePaths = [
            path.join(LEGAL_PATH, `${slug}.${lang}.mdx`),
            path.join(LEGAL_PATH, `${slug}.en.mdx`),
            path.join(LEGAL_PATH, `${slug}.mdx`) // fallback para archivos sin idioma
        ];
        
        let fullPath = '';
        for (const filePath of filePaths) {
            if (fs.existsSync(filePath)) {
                fullPath = filePath;
                break;
            }
        }
        
        if (!fullPath) {
            return (
                <div>
                    <h1>Legal document not found</h1>
                    <p>The requested legal document could not be found.</p>
                </div>
            );
        }
        
        const mdx = fs.readFileSync(fullPath, 'utf8');
        const { content, data } = matter(mdx);
        
        // Reemplazar enlaces estáticos con enlaces dinámicos basados en el idioma
        const processedContent = content.replace(
            /\[([^\]]+)\]\(\/[a-z]{2}(\/legal\/[^)]+)\)/g,
            `[$1](/${lang}$2)`
        );
        
        // Compilar el contenido MDX usando compileMDX
        const { content: compiledContent } = await compileMDX({
            source: processedContent,
            options: {
                parseFrontmatter: true,
            },
        });

        return <LegalContent compiledContent={compiledContent} meta={data} dict={dict} slug={slug} lang={lang} />;
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
