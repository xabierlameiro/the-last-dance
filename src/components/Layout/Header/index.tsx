import React, { ReactNode } from 'react';
import styles from './header.module.css';
import { SiBitcoincash } from 'react-icons/si';
import { useRouter } from 'next/router';
type Props = {
    children: ReactNode;
};

// TODO: Refactor this and internalize
const DateAndHour = () => {
    const [date, setDate] = React.useState(new Date());
    const day = date.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayNumber = date.toLocaleDateString('en-GB', { day: 'numeric' });
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const hour = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric' });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.dateAndHour}>
            <span>{day}</span>
            <span>{dayNumber}</span>
            <span>{month}</span>
            <span>{hour}</span>
        </div>
    );
};

// TODO: Refactor this and internalize
const Route = () => {
    const { pathname } = useRouter();
    let route = pathname;

    switch (pathname) {
        case '/':
            route = 'Code';
            break;
        case '/blog/[category]/[slug]':
            route = 'Notes';
            break;
        case '/comments':
            route = 'Terminal';
            break;
        case '/settings':
            route = 'System Preferences';
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
