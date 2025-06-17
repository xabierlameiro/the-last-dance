import React from 'react';

const scheme = {
    light: 'light' as const,
    dark: 'dark' as const,
};

const useDarkMode = (): { theme: null | 'dark' | 'light'; toggleTheme: () => void; scheme: typeof scheme } => {
    const [theme, setTheme] = React.useState<null | 'dark' | 'light'>(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (event: MediaQueryListEvent) => {
                setTheme(event.matches ? scheme.dark : scheme.light);
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, []);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === scheme.dark ? scheme.light : scheme.dark);
    };

    return { theme, scheme, toggleTheme };
};

export default useDarkMode;
