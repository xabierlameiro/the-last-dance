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
        link: {
            en: '/en',
            es: '/es',
            gl: '/gl',
        },
        testId: 'home',
    },
    {
        img: '/menu/notes.png',
        alt: 'Go to blog',
        link: {
            en: '/en/blog/nextjs/continuous-integration-with-github-actions-workflow',
            es: '/es/blog/nextjs/integracion-continua-con-github-actions-workflow',
            gl: '/gl/blog/nextjs/integracion-continua-con-github-actions-workflow',
        },
        testId: 'blog',
    },
    {
        img: '/menu/terminal.png',
        alt: 'Go to terminal',
        link: {
            en: '/en/comments',
            es: '/es/comments',
            gl: '/gl/comments',
        },
        testId: 'terminal',
    },
    {
        img: '/menu/books.png',
        alt: 'Legal documents',
        link: {
            en: '/en/legal/cookies-policy',
            es: '/es/legal/cookies-policy',
            gl: '/gl/legal/cookies-policy',
        },
        testId: 'legal',
    },
    {
        img: '/menu/settings.png',
        alt: 'Got to configuration page',
        link: {
            en: '/en/settings',
            es: '/es/settings',
            gl: '/gl/settings',
        },
        testId: 'settings',
    },
];
