'use client'

import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslationSimple';
import { useDialog } from '@/context/dialog';
import Link from 'next/link';
import styles from './dock.module.css';
import { clx } from '@/helpers';

/**
 * @description This component is the dock that appears on the bottom of the screen
 * @returns JSX.Element
 */
const Dock = () => {
    const pathname = usePathname();
    const { lang } = useTranslation();
    const { dispatch } = useDialog();
    const clickHandler = () => dispatch({ type: 'open' });

    return (
        <nav className={styles.dock} data-testid="dock">
            <ul>
                {menu.map(({ link, img, alt, testId }, index) => {
                    // Obtener la ruta correcta según el idioma
                    const href = typeof link === 'object' ? link[lang as keyof typeof link] : link;
                    
                    // Validar que href existe antes de renderizar
                    if (!href) {
                        console.warn('Dock: Missing href for menu item', { link, lang, testId });
                        return null;
                    }
                    
                    // Comparar rutas para determinar si está seleccionado
                    const isSelected = pathname === href || 
                        (href && pathname.startsWith(href.replace(/\/[^/]+$/, '')) && href !== `/${lang}`);
                        
                    return (
                        <li
                            key={`${testId}-${index}`}
                            className={clx(isSelected ? styles.selected : '')}
                            data-testid={testId}
                        >
                            <Link 
                                href={href} 
                                title={alt}
                                onClick={clickHandler}
                            >
                                <Icon src={img} alt={alt} />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Dock;
