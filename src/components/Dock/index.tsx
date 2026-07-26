import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import { useRouter } from 'next/router';
import { useDialog } from '@/context/dialog';
import Link from 'next/link';
import styles from './dock.module.css';
import { clx } from '@/helpers';
import { useIntl } from 'react-intl';

/**
 * @description This component is the dock that appears on the bottom of the screen
 * @returns JSX.Element
 */
const Dock = () => {
    const { pathname, locale } = useRouter();
    const { formatMessage: f } = useIntl();
    const { dispatch } = useDialog();
    const clickHandler = () => dispatch({ type: 'open' });

    return (
        <>
            <nav className={styles.dock} data-testid="dock" aria-label={f({ id: 'nav.applications' })}>
                <ul>
                    {menu.map(({ link, img, alt, testId }, index) => {
                        // `?? ''` for the root path: `'/'.split('/')[1]` is `''` but the compiler
                        // cannot know the string starts with a slash.
                        const path = pathname.split('/')[1] ?? '';
                        const term =
                            typeof link === 'object'
                                ? link[locale as keyof typeof link]?.split('/')[1]
                                : link.split('/')[1];
                        const check = term ? path.includes(term) : false;
                        return (
                            /**
                             * SDD-L05: `onClick` moved off the <li> and onto the <Link>. It was not a
                             * keyboard failure — Enter on the inner <a> dispatches a click that bubbles —
                             * but a list item is not an interaction target, and the handler fired for
                             * clicks in the row's padding where no link exists, so the hit area did not
                             * match what the user could see.
                             */
                            <li
                                key={index}
                                className={clx(pathname === link || check ? styles.selected : '')}
                                data-testid={testId}
                            >
                                <Link
                                    href={link?.[locale as keyof typeof link] ?? link}
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
        </>
    );
};

export default Dock;
