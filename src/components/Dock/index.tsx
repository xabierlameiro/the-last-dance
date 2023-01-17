import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import { useRouter } from 'next/router';
import { useDialog } from '@/context/dialog';
import Link from 'next/link';
import styles from './dock.module.css';
import { clx } from '@/helpers';

/**
 * @example
 *     <Dock />;
 *
 * @returns {JSX.Element}
 */
const Dock = () => {
    const { pathname, locale } = useRouter();
    const { dispatch } = useDialog();
    const clickHandler = () => dispatch({ type: 'open' });

    return (
        <>
            <nav className={styles.dock} data-testid="dock">
                <ul>
                    {menu.map(({ link, img, alt }, index) => {
                        // TODO : Refactor this
                        const path = pathname.split('/')[1];
                        /* @ts-ignore */
                        const term = typeof link === 'object' ? link[locale]?.split('/')[1] : link.split('/')[1];
                        const check = term ? path.includes(term) : false;
                        return (
                            <li
                                key={index}
                                onClick={clickHandler}
                                className={clx(pathname === link || check ? styles.selected : '')}
                            >
                                {/* @ts-ignore */}
                                <Link href={link?.[locale] ?? link} title={alt}>
                                    <Icon src={img} alt={alt} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
};

export default Dock;
