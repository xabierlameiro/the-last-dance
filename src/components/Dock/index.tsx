import styles from './dock.module.css';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Dock = () => {
    const { pathname } = useRouter();
    return (
        <>
            <nav className={styles.dock}>
                <ul>
                    {menu.map(({ link, img, alt }, index) => (
                        <li
                            key={index}
                            className={`${
                                pathname === link ? styles.selected : ''
                            }`}
                        >
                            {link ? (
                                <Link href={link}>
                                    <Icon src={img} alt={alt} />
                                </Link>
                            ) : (
                                <Icon src={img} alt={alt} />
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Dock;
