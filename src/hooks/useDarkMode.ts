import React from 'react';

const scheme = {
    light: 'light' as const,
    dark: 'dark' as const,
};

/** Where an explicit choice is kept, so it survives a reload and outranks the OS preference. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * @description The active theme, and a way to change it.
 *
 * SDD-L06. This used to initialise to `null` and only call `setTheme` from the media-query **change**
 * listener — it never read `mediaQuery.matches` on mount. So `data-theme` stayed at the `"light"`
 * hardcoded in `_document.tsx` unless the visitor flipped their OS theme mid-session, and a
 * dark-preference visitor got the light palette. That is what turned the light theme's contrast
 * failures from theme-specific into universal, and it also meant the dark theme was effectively never
 * exercised: several of its tokens had never been rendered.
 *
 * An explicit choice is now persisted and wins over the OS preference, which is what a theme toggle
 * is for — otherwise the next OS change would silently undo it.
 *
 * @returns {object} theme, toggleTheme and the scheme constants.
 */
const useDarkMode = (): { theme: null | 'dark' | 'light'; toggleTheme: () => void; scheme: typeof scheme } => {
    const [theme, setTheme] = React.useState<null | 'dark' | 'light'>(null);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return undefined;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Resolve after mount rather than during render: reading storage or matchMedia while
        // rendering would make the server and client markup disagree.
        let stored: string | null = null;
        try {
            stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        } catch {
            // Storage blocked (private mode, extensions). Fall through to the OS preference.
        }

        if (stored === scheme.dark || stored === scheme.light) {
            setTheme(stored);
        } else {
            setTheme(mediaQuery.matches ? scheme.dark : scheme.light);
        }

        // Follow the OS only while the visitor has not made a choice of their own.
        const handler = (event: MediaQueryListEvent) => {
            let hasExplicitChoice = false;
            try {
                hasExplicitChoice = window.localStorage.getItem(THEME_STORAGE_KEY) !== null;
            } catch {
                hasExplicitChoice = false;
            }
            if (!hasExplicitChoice) setTheme(event.matches ? scheme.dark : scheme.light);
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme((current) => {
            const next = current === scheme.dark ? scheme.light : scheme.dark;
            try {
                window.localStorage.setItem(THEME_STORAGE_KEY, next);
            } catch {
                // The choice still applies to this page view.
            }
            return next;
        });
    }, []);

    return { theme, scheme, toggleTheme };
};

export default useDarkMode;
