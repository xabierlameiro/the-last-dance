import * as React from 'react';
import type { Metadata } from 'next';
import Dialog from '@/components/Dialog';
import VisibilityManager from '@/components/VisibilityManager';

// Import MDX content directly
import DesktopContentEs from '../../../data/home/desktop.es.mdx'
import MobileContentEs from '../../../data/home/mobile.es.mdx'
import DesktopContentEn from '../../../data/home/desktop.en.mdx'
import MobileContentEn from '../../../data/home/mobile.en.mdx'
import DesktopContentGl from '../../../data/home/desktop.gl.mdx'
import MobileContentGl from '../../../data/home/mobile.gl.mdx'

type Props = {
    params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    
    const titles = {
        es: 'Inicio - Xabier Lameiro',
        en: 'Home - Xabier Lameiro', 
        gl: 'Inicio - Xabier Lameiro'
    };
    
    const descriptions = {
        es: 'Desarrollador Frontend especializado en React, TypeScript y tecnologías web modernas',
        en: 'Frontend developer specialized in React, TypeScript and modern web technologies',
        gl: 'Desenvolvedor Frontend especializado en React, TypeScript e tecnoloxías web modernas'
    };
    
    return {
        title: titles[lang as keyof typeof titles] || titles.es,
        description: descriptions[lang as keyof typeof descriptions] || descriptions.es,
    };
}

export default async function HomePage({ params }: Props) {
    const { lang } = await params;
    
    // Select content based on language
    const getContent = (lang: string) => {
        switch (lang) {
            case 'en':
                return { Desktop: DesktopContentEn, Mobile: MobileContentEn };
            case 'gl':
                return { Desktop: DesktopContentGl, Mobile: MobileContentGl };
            case 'es':
            default:
                return { Desktop: DesktopContentEs, Mobile: MobileContentEs };
        }
    };
    
    const { Desktop, Mobile } = getContent(lang);

    return (
        <Dialog
            className="home"
            modalMode
            open={true}
            body={
                <>
                    <VisibilityManager hideOnDesktop hideOnTablet>
                        <Mobile />
                    </VisibilityManager>
                    <VisibilityManager hideOnMobile>
                        <Desktop />
                    </VisibilityManager>
                </>
            }
        />
    );
}
