import React, { ReactNode } from 'react';
import styles from './header.module.css';
import { SiBitcoincash } from 'react-icons/si';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
type Props = {
    children: ReactNode;
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
    const { formatMessage: f } = useIntl();
    let route = pathname;

    switch (pathname) {
        case '/':
            route = f({ id: 'home.breadcrumb' });
            break;
        case '/blog/[category]/[slug]':
            route = f({ id: 'blog.breadcrumb' });
            break;
        case '/legal/[slug]':
            route = f({ id: 'legal.breadcrumb' });
            break;
        case '/comments':
            route = f({ id: 'comments.breadcrumb' });
            break;
        case '/settings':
            route = f({ id: 'settings.breadcrumb' });
            break;
    }

    return <span className={styles.route}>{route}</span>;
};

const NavLinks = () => {
    return (
        <nav className={styles.navLinks}>
            <a
                href="https://www.linkedin.com/in/xlameiro/"
                target="_blank"
                rel="noopener noreferrer"
                title="Linkedin profile"
            >
                Linkedin
            </a>
            <a href="https://github.com/xabierlameiro" target="_blank" rel="noopener noreferrer" title="Github profile">
                Github
            </a>
            <a
                href="https://www.reddit.com/user/xlameiro"
                target="_blank"
                rel="noopener noreferrer"
                title="Reddit profile"
            >
                Reddit
            </a>
        </nav>
    );
};

const Header = ({ children }: Props) => {
    return (
        <header data-testid="header" className={styles.header}>
            <SiBitcoincash />
            <Route />
            <NavLinks />
            <DateAndHour />
            {children}
        </header>
    );
};

export default Header;
