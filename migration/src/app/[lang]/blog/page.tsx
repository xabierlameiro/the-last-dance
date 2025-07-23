import { getAllCategories, getPostsByLocale } from '@/helpers/fileReader';
import { Metadata } from 'next';
import BlogContent from './BlogContent';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    
    return {
        title: 'Blog - Xabier Lameiro',
        description: 'Technical blog about web development, Next.js, React, and more.',
        alternates: {
            canonical: `/${lang}/blog`,
            languages: {
                'en': '/en/blog',
                'es': '/es/blog',
                'gl': '/gl/blog',
            },
        },
    };
}

export default async function BlogPage({ params }: Props) {
    const { lang } = await params;
    
    // Obtener todos los posts del idioma actual
    const posts = getPostsByLocale(lang);
    
    // Obtener categorías y tags
    const { categories, tags } = getAllCategories(lang);
    
    return (
        <BlogContent 
            posts={posts} 
            categories={categories} 
            tags={tags} 
            lang={lang}
        />
    );
}
