type Item = {
    img: string;
    alt: string;
    link: { en: string; es: string; gl: string } | string;
    testId: string;
};

export const menu: Array<Item> = [
    {
        img: '/menu/vscode.png',
        alt: 'Go to home page',
        link: '/',
        testId: 'home',
    },
    {
        img: '/menu/notes.png',
        alt: 'Go to blog',
        // /blog redirects to the newest post in the active locale, so the Dock never points at a
        // slug that ages out (or 404s once that post is renamed). Link carries the current locale.
        link: '/blog',
        testId: 'blog',
    },
    {
        img: '/menu/terminal.png',
        alt: 'Go to terminal',
        link: '/comments',
        testId: 'terminal',
    },
    {
        img: '/menu/books.png',
        alt: 'Legal documents',
        link: '/legal/cookies-policy',
        testId: 'legal',
    },
    {
        img: '/menu/settings.png',
        alt: 'Got to configuration page',
        link: '/settings',
        testId: 'settings',
    },
];
