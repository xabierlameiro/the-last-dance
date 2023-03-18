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
        link: {
            en: '/blog/react/filter-for-positions',
            es: '/blog/react/filtro-para-posiciones',
            gl: '/blog/react/filtro-para-posicions',
        },
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
