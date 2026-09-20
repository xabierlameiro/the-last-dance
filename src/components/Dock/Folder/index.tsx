import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import Icon from '@/components/Dock/Icon';
import type { Tool } from '@/constants/navMenu';
import { clx } from '@/helpers';
import styles from './folder.module.css';

type Props = {
    label: string;
    img: string;
    tools: Array<Tool>;
    /** The Dock closes its dialog when a link is followed; the folder does the same. */
    onNavigate: () => void;
};

const PANEL_ID = 'dock-tools-panel';

/**
 * A Dock folder: one slot that opens a small panel above the Dock listing the tools.
 *
 * It is not a route. `/next-leak` and `/next-coverage` stay the canonical entries, so the folder
 * must not take a URL of its own or appear in the sitemap.
 *
 * The panel is always in the DOM and only `hidden` when closed, so both anchors are in the server
 * HTML. That is how `/next-leak` is reachable from the home page today, and a panel that only
 * existed after hydration would take that away from the new page.
 */
const Folder = ({ label, img, tools, onNavigate }: Props) => {
    const { formatMessage: f } = useIntl();
    const { asPath } = useRouter();
    const [open, setOpen] = React.useState(false);
    const trigger = React.useRef<HTMLButtonElement>(null);
    const wrapper = React.useRef<HTMLDivElement>(null);

    // A route change means the panel did its job, or the user left by other means.
    React.useEffect(() => {
        setOpen(false);
    }, [asPath]);

    React.useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event: MouseEvent) => {
            if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setOpen(false);
            // Escape returns focus to the trigger; otherwise it lands on <body>.
            trigger.current?.focus();
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return (
        <div className={styles.folder} ref={wrapper}>
            <button
                ref={trigger}
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={PANEL_ID}
                title={label}
                onClick={() => setOpen((was) => !was)}
            >
                <Icon src={img} alt="" />
                <span className={styles.label}>{label}</span>
            </button>
            <ul id={PANEL_ID} hidden={!open} className={clx(styles.panel, open ? styles.opened : '')}>
                {tools.map(({ labelId, link, testId }) => (
                    <li key={link} data-testid={`tools-${testId}`}>
                        <Link
                            href={link}
                            className={clx(styles.entry, asPath === link ? styles.current : '')}
                            aria-current={asPath === link ? 'page' : undefined}
                            onClick={() => {
                                setOpen(false);
                                onNavigate();
                            }}
                        >
                            {f({ id: labelId })}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Folder;
