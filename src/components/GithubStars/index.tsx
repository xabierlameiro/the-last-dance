import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import { GoRepoForked, GoEye, GoIssueOpened } from 'react-icons/go';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useGithubStars from '@/hooks/useGithubStars';
import RenderManager from '@/components/RenderManager';
import { REPOSITORY_URL } from '@/constants/site';
import { clx } from '@/helpers';
import styles from './githubStars.module.css';

const PANEL_ID = 'github-stars-panel';

/**
 * How long ago the last push was, in the coarsest unit that is still true. `Intl.RelativeTimeFormat`
 * does the wording per locale, so this never assembles a sentence by hand.
 */
const sincePush = (pushedAt: string, locale: string): string | null => {
    const at = Date.parse(pushedAt);
    if (Number.isNaN(at)) return null;

    const seconds = Math.round((at - Date.now()) / 1000);
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];
    const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
    }
    return format.format(0, 'minute');
};

/**
 * A menu bar extra for the repository, of the kind macOS puts to the left of the clock: the count
 * is always on the bar, and clicking it opens a panel that reports the rest and offers the one
 * action worth offering.
 *
 * It deliberately does not link anywhere on the bar itself. The count is a status, and a status
 * that navigates away on a stray click is a trap — the `<a>` lives inside the panel, where the
 * reader has already said they are interested.
 */
const GithubStars = () => {
    const { data, error, loading } = useGithubStars();
    const { formatMessage: f, formatNumber } = useIntl();
    const { locale = 'en' } = useRouter();
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);

    const close = React.useCallback(() => setOpen(false), []);

    React.useEffect(() => {
        if (!open) return undefined;

        /**
         * Escape returns focus to the trigger, which is what a menu bar extra does and what a
         * keyboard reader needs: dismissing the panel must not drop the caret at the top of the
         * document.
         */
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
                triggerRef.current?.focus();
            }
        };
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, [open, close]);

    const updated = data?.pushedAt ? sincePush(data.pushedAt, locale) : null;

    return (
        <div className={styles.extra}>
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={PANEL_ID}
                aria-label={f({ id: 'githubStars.open' })}
                onClick={() => setOpen((wasOpen) => !wasOpen)}
            >
                <AiFillStar className={styles.star} aria-hidden="true" />
                <RenderManager
                    loading={loading}
                    error={error}
                    errorTitle={f({ id: 'starCounter.error' })}
                    loadingTitle={f({ id: 'starCounter.loading' })}
                >
                    <span data-testid="github-stars-count">{formatNumber(data?.stars ?? 0)}</span>
                </RenderManager>
            </button>

            {/*
             * Always rendered, hidden by the attribute. A panel that only exists while open cannot
             * be the target of `aria-controls`, and mounting it on first click is a layout jump
             * inside a 24px bar.
             */}
            <div
                ref={panelRef}
                id={PANEL_ID}
                data-testid="github-stars-panel"
                className={clx(styles.panel, open ? styles.opened : undefined)}
                hidden={!open}
            >
                <p className={styles.repo}>{f({ id: 'githubStars.repo' })}</p>
                <p className={styles.tagline}>{f({ id: 'githubStars.tagline' })}</p>

                <ul className={styles.counters}>
                    <li>
                        <AiFillStar className={styles.star} aria-hidden="true" />
                        <span className={styles.value}>{formatNumber(data?.stars ?? 0)}</span>
                        <span className={styles.caption}>{f({ id: 'githubStars.stars' })}</span>
                    </li>
                    <li>
                        <GoRepoForked aria-hidden="true" />
                        <span className={styles.value}>{formatNumber(data?.forks ?? 0)}</span>
                        <span className={styles.caption}>{f({ id: 'githubStars.forks' })}</span>
                    </li>
                    <li>
                        <GoEye aria-hidden="true" />
                        <span className={styles.value}>{formatNumber(data?.watchers ?? 0)}</span>
                        <span className={styles.caption}>{f({ id: 'githubStars.watchers' })}</span>
                    </li>
                    <li>
                        <GoIssueOpened aria-hidden="true" />
                        <span className={styles.value}>{formatNumber(data?.issues ?? 0)}</span>
                        <span className={styles.caption}>{f({ id: 'githubStars.issues' })}</span>
                    </li>
                </ul>

                {updated && <p className={styles.updated}>{f({ id: 'githubStars.updated' }, { when: updated })}</p>}

                <a
                    className={styles.cta}
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                >
                    <AiFillStar aria-hidden="true" />
                    {f({ id: 'githubStars.cta' })}
                </a>
            </div>
        </div>
    );
};

export default GithubStars;
