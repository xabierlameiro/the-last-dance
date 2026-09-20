import React from 'react';
import { menu } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import Folder from '@/components/Dock/Folder';
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
                    {menu.map(({ link, img, labelId, shortLabelId, testId, tools }, index) => {
                        const label = f({ id: labelId });
                        // `?? ''` for the root path: `'/'.split('/')[1]` is `''` but the compiler
                        // cannot know the string starts with a slash.
                        const path = pathname.split('/')[1] ?? '';
                        const term =
                            typeof link === 'object'
                                ? link[locale as keyof typeof link]?.split('/')[1]
                                : link?.split('/')[1];
                        const check = term ? path.includes(term) : false;
                        // `link` is optional since SDD-015 (a folder has none), so the per-locale
                        // lookup that used to read straight off it needs the guard.
                        const href = typeof link === 'object' ? (link[locale as keyof typeof link] ?? '/') : link;
                        // A folder is marked as current when the open page is one of the tools it holds.
                        const selected = tools
                            ? tools.some((tool) => tool.link === pathname)
                            : pathname === link || check;
                        return (
                            /**
                             * SDD-L05: `onClick` moved off the <li> and onto the <Link>. It was not a
                             * keyboard failure — Enter on the inner <a> dispatches a click that bubbles —
                             * but a list item is not an interaction target, and the handler fired for
                             * clicks in the row's padding where no link exists, so the hit area did not
                             * match what the user could see.
                             */
                            <li key={index} className={clx(selected ? styles.selected : '')} data-testid={testId}>
                                {tools ? (
                                    <Folder label={label} img={img} tools={tools} onNavigate={clickHandler} />
                                ) : (
                                    <Link
                                        href={href ?? '/'}
                                        title={label}
                                        aria-label={label}
                                        onClick={clickHandler}
                                        className={shortLabelId ? styles.hasShortLabel : undefined}
                                    >
                                        {/*
                                         * SDD-L08: the icon's alt is empty and the label below carries
                                         * the name instead. With both, a screen reader announced the
                                         * destination twice per item; with only the alt, a touch user
                                         * saw nothing at all, since the hover cue sits behind
                                         * `@media (hover: hover)`.
                                         */}
                                        <Icon src={img} alt="" />
                                        <span className={styles.label}>{label}</span>
                                        {shortLabelId && (
                                            <span className={clx(styles.label, styles.shortLabel)} aria-hidden="true">
                                                {f({ id: shortLabelId })}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
};

export default Dock;
