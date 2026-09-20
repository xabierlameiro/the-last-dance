import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import { SiGithub } from 'react-icons/si';
import { useIntl } from 'react-intl';
import { REPOSITORY_URL } from '@/constants/site';
import { clx } from '@/helpers';
import styles from './starPrompt.module.css';

export const STAR_PROMPT_STORAGE_KEY = 'star-prompt';

/** How far down the surface counts as having read it. */
const READ_FRACTION = 0.6;
/** And how long, so that a flick of the wheel to the bottom does not qualify. */
const DWELL_MS = 30_000;
/**
 * Below this, a scroller is a list or a sidebar rather than something that was read. Measured: the
 * blog body is 2409px and the privacy policy 4692, against an 800px window.
 */
const MIN_SCROLLABLE_PX = 400;

/**
 * A macOS notification asking for a star, shown once per browser and never on arrival.
 *
 * The menu bar extra beside the clock is the permanent, passive half of this: it is there for
 * anyone who looks. This is the other half — it asks, once, and only of someone who has actually
 * read something. Both conditions have to hold: 60% of the surface AND 30 seconds on it, because
 * either one alone is satisfied by a wheel flick or by an abandoned tab.
 *
 * **The window never scrolls here.** This is a desktop simulation: `document.documentElement` is
 * exactly the viewport on every route, and the reading happens inside a panel — the blog body and
 * the legal article are the two that scroll, at 2409px and 4692px against an 800px window. A
 * listener on `window` would therefore never have fired once, which is how this was written first
 * and what measuring it caught. So the listener is on `document` in the CAPTURE phase, because a
 * scroll event on an element does not bubble, and the fraction is read off whatever scrolled.
 *
 * The key is written the moment it appears, not when it is answered. Ignoring a request is an
 * answer, and a prompt that returns until it gets a click is the pattern this is trying not to be.
 */
const StarPrompt = () => {
    const { formatMessage: f } = useIntl();
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        let alreadyAsked = true;
        try {
            alreadyAsked = window.localStorage.getItem(STAR_PROMPT_STORAGE_KEY) !== null;
        } catch {
            /* Private mode, or storage denied. Saying nothing is the safe direction. */
        }
        if (alreadyAsked) return undefined;

        const openedAt = Date.now();
        const onScroll = (event: Event) => {
            const target = event.target;
            const scroller = target instanceof Element ? target : document.documentElement;
            const scrollable = scroller.scrollHeight - scroller.clientHeight;
            if (scrollable < MIN_SCROLLABLE_PX) return;

            const read = (scroller.scrollTop + scroller.clientHeight) / scroller.scrollHeight;
            if (read < READ_FRACTION || Date.now() - openedAt < DWELL_MS) return;

            document.removeEventListener('scroll', onScroll, true);
            try {
                window.localStorage.setItem(STAR_PROMPT_STORAGE_KEY, 'seen');
            } catch {
                /* See above: if it cannot be recorded it will simply be asked again. */
            }
            setVisible(true);
        };

        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        return () => document.removeEventListener('scroll', onScroll, true);
    }, []);

    const answer = React.useCallback((choice: 'starred' | 'dismissed') => {
        try {
            window.localStorage.setItem(STAR_PROMPT_STORAGE_KEY, choice);
        } catch {
            /* The prompt is closing either way. */
        }
        setVisible(false);
    }, []);

    React.useEffect(() => {
        if (!visible) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') answer('dismissed');
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [visible, answer]);

    if (!visible) return null;

    return (
        <div data-testid="star-prompt" role="status" className={clx(styles.banner, styles.enter)}>
            <span className={styles.icon} aria-hidden="true">
                <SiGithub />
            </span>
            <div className={styles.body}>
                <p className={styles.title}>{f({ id: 'starPrompt.title' })}</p>
                <p className={styles.message}>{f({ id: 'starPrompt.message' })}</p>
                <div className={styles.actions}>
                    <a
                        className={styles.accept}
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => answer('starred')}
                    >
                        <AiFillStar aria-hidden="true" />
                        {f({ id: 'starPrompt.accept' })}
                    </a>
                    <button type="button" className={styles.dismiss} onClick={() => answer('dismissed')}>
                        {f({ id: 'starPrompt.dismiss' })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StarPrompt;
