type Item = {
    img: string;
    alt: string;
    link: { en: string; es: string; gl: string } | string;
};

export const menu: Array<Item> = [
    {
        img: '/menu/vscode.png',
        alt: 'Go to home page',
        link: '/',
    },
    {
        img: '/menu/notes.png',
        alt: 'Go to blog',
        link: {
            en: '/blog/react/how-document-my-react-components-with-jsdoc',
            es: '/blog/react/documentar-mis-componentes-de-react',
            gl: '/blog/react/documentar-os-meus-compoñentes-de-react',
        },
    },
    {
        img: '/menu/terminal.png',
        alt: 'Go to terminal',
        link: '/comments',
    },
    {
        img: '/menu/books.png',
        alt: 'Legal documents',
        link: '/legal/cookies-policy',
    },
    {
        img: '/menu/settings.png',
        alt: 'Got to configuration page',
        link: '/settings',
    },
];
