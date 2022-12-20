import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './dock.module.css';

const Dock = () => {
    const { pathname } = useRouter();

    return (
        <>
            <nav className={styles.dock} data-testid="dock">
                <ul>
                    {menu.map(({ link, img, alt }, index) => (
                        <li
                            key={index}
                            className={`${
                                pathname === link ? styles.selected : ''
                            }`}
                        >
                            <Link href={link}>
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
