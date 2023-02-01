import React, { ReactNode } from 'react';
import styles from './header.module.css';
import { SiBitcoincash } from 'react-icons/si';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { socialLinks, translateRoute } from '@/constants/site';
import CryptoPrice from '@/components/CryptoPrice';
import ViewCounter from '@/components/Blog/ViewCounter';
import IndexedCounter from '@/components/IndexedCounter';
import CountDown from '@/components/CountDown';
import Heating from '@/components/Heating';
import Tooltip from '@/components/Tooltip';
import dynamic from 'next/dynamic';
import useDarkMode from '@/hooks/useDarkMode';

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
                    <div className={styles.dateAndHour} onClick={() => setOpenWeatherWidget(true)}>
                        <span suppressHydrationWarning>{day}</span>
                        <span suppressHydrationWarning>{dayNumber}</span>
                        <span suppressHydrationWarning>{month}</span>
                        <span suppressHydrationWarning>{hour}</span>
                    </div>
                </Tooltip.Trigger>
                <Tooltip.Content>{f({ id: 'weather.tooltip' })}</Tooltip.Content>
            </Tooltip>
            {children &&
                React.cloneElement(children as React.ReactElement, {
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
    let route = translateRoute(pathname, formatMessage);

    return <span className={styles.route}>{route}</span>;
};

/**
 * @description Social links component
 * @returns {JSX.Element}
 */
const NavLinks = () => {
    return (
        <nav className={styles.navLinks}>
            {socialLinks.map((item) => (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" title={item.title}>
                    {item.name}
                </a>
            ))}
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
    const { theme, toggleTheme } = useDarkMode();

    return (
        <header data-testid="header" className={styles.header}>
            <SiBitcoincash />
            <Route />
            <NavLinks />
            <CountDown date="2023-05-06T00:00:00+00:00" caption={f({ id: 'countdown.caption' })} />
            <span className={styles.button} onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌚'}
            </span>
            <CryptoPrice />
            <IndexedCounter />
            <ViewCounter all />
            <Heating />
            <DateAndHour>
                <Weather cities={['limerick+ireland', 'moraña+galicia', 'vilagarcía+galicia']} />
            </DateAndHour>
            {children}
        </header>
    );
};

export default Header;
