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
                    const path = pathname.split('/')[1];
                    const term =
                        typeof link === 'object'
                            ? link[lang as keyof typeof link]?.split('/')[1]
                            : link.split('/')[1];
                    const check = term ? path.includes(term) : false;
                        
                    return (
                        <li
                            key={`${testId}-${index}`}
                            className={clx(pathname === link || check ? styles.selected : '')}
                            data-testid={testId}
                        >
                            <Link 
                                href={link?.[lang as keyof typeof link] ?? link} 
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
