import React, { ReactNode } from 'react';
import styles from './header.module.css';
import type { IconType } from 'react-icons';
import {
    SiBitcoincash,
    SiCodecov,
    SiGithub,
    SiLighthouse,
    SiLinkedin,
    SiPlaywright,
    SiReadthedocs,
    SiReddit,
    SiStorybook,
} from 'react-icons/si';
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
        <div>
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
    'coverage-link': SiCodecov,
    'e2e-link': SiPlaywright,
    'lighthouse-link': SiLighthouse,
};

/**
 * @description The status items of the menu bar: profile and artifact links, as icons on the right.
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
                <NavLinks />
                <span>
                    <DeploymentStatus />
                </span>
                <span className={styles.shed3}>
                    <CryptoPrice />
                </span>
                <span className={styles.shed4}>
                    <IndexedCounter />
                </span>
                <span className={styles.shed1}>
                    <ViewCounter all />
                </span>
                <span className={styles.shed2}>
                    <Heating />
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
