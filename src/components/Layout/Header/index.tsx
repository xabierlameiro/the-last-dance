import React, { ReactNode } from 'react';
import styles from './header.module.css';
import { SiBitcoincash } from 'react-icons/si';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { socialLinks, translateRoute } from '@/constants/site';
import CryptoPrice from '@/components/CryptoPrice';
import ViewCounter from '@/components/Blog/ViewCounter';
import IndexedCounter from '@/components/IndexedCounter';

type Props = {
    children?: ReactNode;
};

const DateAndHour = () => {
    const { locale } = useRouter();
    const [date, setDate] = React.useState(new Date());
    const day = date.toLocaleDateString(locale, { weekday: 'short' });
    const dayNumber = date.toLocaleDateString(locale, { day: 'numeric' });
    const month = date.toLocaleDateString(locale, { month: 'short' });
    const hour = date.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.dateAndHour}>
            <span suppressHydrationWarning>{day}</span>
            <span suppressHydrationWarning>{dayNumber}</span>
            <span suppressHydrationWarning>{month}</span>
            <span suppressHydrationWarning>{hour}</span>
        </div>
    );
};

const Route = () => {
    const { pathname } = useRouter();
    const { formatMessage } = useIntl();
    let route = translateRoute(pathname, formatMessage);
    return <span className={styles.route}>{route}</span>;
};

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

const Header = ({ children }: Props) => {
    return (
        <header data-testid="header" className={styles.header}>
            <SiBitcoincash />
            <Route />
            <NavLinks />
            {/* <CryptoPrice /> */}
            <div />
            <div />
            {/* <IndexedCounter /> */}
            <ViewCounter all />
            <DateAndHour />
            {children}
        </header>
    );
};

export default Header;
