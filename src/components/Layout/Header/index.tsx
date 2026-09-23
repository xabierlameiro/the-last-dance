import React, { ReactNode } from 'react';
import styles from './header.module.css';
import type { IconType } from 'react-icons';
import { SiBitcoincash, SiGithub, SiLinkedin, SiReadthedocs, SiReddit, SiStorybook } from 'react-icons/si';
import { FaChartPie, FaCheckDouble } from 'react-icons/fa';
import { FaGaugeHigh } from 'react-icons/fa6';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { socialLinks, translateRoute } from '@/constants/site';
import CryptoPrice from '@/components/CryptoPrice';
import ViewCounter from '@/components/Blog/ViewCounter';
import IndexedCounter from '@/components/IndexedCounter';
import CountDown from '@/components/CountDown';
import Heating from '@/components/Heating';
import Tooltip from '@/components/Tooltip';
import DeploymentStatus from '@/components/DeploymentStatus';
import GithubStars from '@/components/GithubStars';
import dynamic from 'next/dynamic';

const Weather = dynamic(() => import('@/components/Weather'), {
    ssr: false,
});

/**
 * @description This component is a Clock and a Weather Widget
 * @param {ReactNode} children - The children
 * @param {number} minutes - The number of minutes to update the clock
 * @returns {JSX.Element}
 */
const DateAndHour = ({ children, minutes = 1 }: { children?: ReactNode; minutes?: number }) => {
    const { locale } = useRouter();
    const { formatMessage: f } = useIntl();
    const [date, setDate] = React.useState(new Date());
    const [openWeatherWidget, setOpenWeatherWidget] = React.useState<boolean>(false);
    const day = date.toLocaleDateString(locale, { weekday: 'short' });
    const dayNumber = date.toLocaleDateString(locale, { day: 'numeric' });
    const month = date.toLocaleDateString(locale, { month: 'short' });
    const hour = date.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });

    const handleWeatherClick = React.useCallback(() => {
        setOpenWeatherWidget(true);
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date());
        }, 60000 * minutes);
        return () => clearInterval(interval);
    }, [minutes]);

    return (
        <div className={styles.clock}>
            <Tooltip>
                <Tooltip.Trigger>
                    <button type="button" className={styles.dateAndHour} onClick={handleWeatherClick}>
                        <span suppressHydrationWarning>{day}</span>
                        <span suppressHydrationWarning>{dayNumber}</span>
                        <span suppressHydrationWarning>{month}</span>
                        <span suppressHydrationWarning>{hour}</span>
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Content>{f({ id: 'weather.tooltip' })}</Tooltip.Content>
            </Tooltip>
            {children &&
                React.cloneElement(children as React.ReactElement<{ open?: boolean; handleClose?: () => void }>, {
                    open: openWeatherWidget,
                    handleClose: () => setOpenWeatherWidget(false),
                })}
        </div>
    );
};

/**
 * @description Translate the route to the current language
 * @returns {JSX.Element}
 */
const Route = () => {
    const { pathname } = useRouter();
    const { formatMessage } = useIntl();
    const route = translateRoute(pathname, formatMessage);

    return <span className={styles.route}>{route}</span>;
};

/**
 * SDD-L12-T8. One icon per status item, keyed by `testId` so a rename in `site.ts` fails loudly
 * here rather than silently rendering nothing. Kept in the component because `site.ts` is data —
 * importing React components into it would make every consumer of the constants pull in icons.
 */
const STATUS_ICONS: Record<string, IconType> = {
    'linkedin-link': SiLinkedin,
    'github-link': SiGithub,
    'reddit-link': SiReddit,
    'storybook-link': SiStorybook,
    'docs-link': SiReadthedocs,
    /**
     * The last three are generic glyphs rather than the brands they link to, for the same reason in
     * each case: all three point at a report this repository generates about itself, so there is no
     * brand to honour, and all three brand marks fail the bar's sizing rule.
     *
     * A pie chart, not Codecov's umbrella: the umbrella inks 28% of its box against the bar's 56%
     * median, which no size inside a 24px bar could correct.
     *
     * A double check and a gauge, not Playwright's masks and Lighthouse's tower. The bar sizes every
     * glyph so its largest side is exactly 16px (`header.module.css`), which leaves the shorter side
     * to the glyph's own proportions — and those two were the extremes of the set, the masks at
     * 1.37:1 and the tower at 0.67:1 against 0.77-1.06 for everything else. Measured on the
     * candidates, both replacements are 1.000:1 and ink their box on both axes, so a ruler laid
     * across the row reads the same on either one. A double check is what a green e2e run reports,
     * and a gauge is the dial Lighthouse draws its score on.
     */
    'coverage-link': FaChartPie,
    'e2e-link': FaCheckDouble,
    'lighthouse-link': FaGaugeHigh,
};

/**
 * @description The profile and artifact links, as icons in the left zone beside the identity.
 *
 * SDD-L12-T9. T8 put them in the right zone, which read as a second cluster of status items hanging
 * off the countdown. They are navigation, not status — on a macOS menu bar that belongs next to the
 * app identity — and that is also where they were before T8 moved them.
 * @returns {JSX.Element}
 */
const NavLinks = () => {
    const { formatMessage: f } = useIntl();

    return (
        // SDD-L05: landmark navigation listed "navigation, navigation" (four of them on a post page)
        // with nothing to tell the social links from the Dock from the category sidebar.
        <nav className={styles.navLinks} aria-label={f({ id: 'nav.social' })}>
            {socialLinks.map((item) => {
                const Icon = STATUS_ICONS[item.testId];

                return (
                    <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.title}
                        data-testid={item.testId}
                        // SDD-L12-T8: the visible label is now an icon, so the accessible name has
                        // to come from here. Without it these read as "link, link, link" — the
                        // exact defect L05/L06 spent two phases removing from the rest of the page.
                        aria-label={item.title}
                        // Carries the optical size and box width the icon is drawn at — one rule per
                        // icon in the stylesheet rather than nine classes threaded through here.
                        data-icon={item.testId}
                        className={styles[`shed${item.shed}`]}
                    >
                        {Icon ? <Icon aria-hidden="true" /> : item.name}
                    </a>
                );
            })}
        </nav>
    );
};

/**
 * @description Header navigation bar component with the following features:
 * - Bitcoin logo
 * - Current route
 * - Social links
 * - XRP price
 * - Indexed pages counter
 * - Total views counter
 * - Heating temperature
 * - Date and hour
 * - Weather Widget
 * @param {ReactNode} children - The children to display: ;
 * @returns {JSX.Element}
 */
const Header = ({ children }: { children?: ReactNode }) => {
    const { formatMessage: f } = useIntl();

    return (
        <header data-testid="header" className={styles.header}>
            {/**
             * SDD-L12-T8. Three zones, because that is what a macOS menu bar is: the app identity on
             * the left, the clock and status items on the right, and — here — the countdown holding
             * the middle. It replaced a nine-column grid that laid every widget out in a single run
             * and simply overflowed when the run got long.
             */}
            <div className={styles.left}>
                <SiBitcoincash aria-hidden="true" />
                <Route />
                <NavLinks />
            </div>

            <div className={styles.center}>
                <CountDown date="2026-12-11T00:00:00+00:00" caption={f({ id: 'countdown.caption' })} />
            </div>

            {/**
             * Shed order, cheapest information per pixel first. The classes are `shedN`, and the
             * widths behind each breakpoint are tabulated in `header.module.css` — they are derived
             * from measurements, not chosen for tidiness.
             */}
            <div className={styles.right}>
                <span className={styles.statusDot}>
                    <DeploymentStatus />
                </span>
                <span className={`${styles.statusItem} ${styles.shed3}`}>
                    <CryptoPrice />
                </span>
                <span className={`${styles.statusItem} ${styles.shed4}`}>
                    <IndexedCounter />
                </span>
                {/**
                 * These two render TWO values each — `ViewCounter all` is page views AND new users,
                 * `Heating` is the outside and measured temperatures — so they are the widest items
                 * in the row and the first to shed. They used to carry a per-widget slot width;
                 * every item is now `max-content` and the ladder is derived from their worst case.
                 */}
                <span className={`${styles.statusItem} ${styles.shed1}`}>
                    <ViewCounter all />
                </span>
                <span className={`${styles.statusItem} ${styles.shed2}`}>
                    <Heating />
                </span>
                {/**
                 * Last before the clock, which is where macOS puts the extras a person added
                 * themselves, and the only status item here that is also an invitation.
                 */}
                <span className={`${styles.slotStars} ${styles.shed7}`}>
                    <GithubStars />
                </span>
                <DateAndHour>
                    <Weather cities={['limerick+ireland', 'moraña+galicia', 'vilagarcía+galicia']} />
                </DateAndHour>
                {children}
            </div>
        </header>
    );
};

export default Header;
