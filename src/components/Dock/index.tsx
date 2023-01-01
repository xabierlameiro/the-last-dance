import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import { useRouter } from 'next/router';
import { useDialog } from '@/context/dialog';
import Link from 'next/link';
import styles from './dock.module.css';
import { clx } from '@/helpers';

const Dock = () => {
    const { pathname, locale } = useRouter();
    const { dispatch } = useDialog();

    return (
        <>
            <nav className={styles.dock} data-testid="dock">
                <ul>
                    {menu.map(({ link, img, alt }, index) => (
                        <li
                            key={index}
                            onClick={() => dispatch({ type: 'open' })}
                            className={clx(
                                pathname === link ||
                                    pathname.includes(
                                        // @ts-ignore
                                        link[locale]?.split('/')[1]
                                    )
                                    ? styles.selected
                                    : ''
                            )}
                        >
                            {/* @ts-ignore */}
                            <Link href={link?.[locale] ?? link} title={alt}>
                                <Icon src={img} alt={alt} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Dock;
