type Item = {
    img: string;
    alt: string;
    link: { en: string; es: string; gl: string } | string;
};

export const menu: Array<Item> = [
    {
        img: 'https://code.visualstudio.com/assets/branding/app-icon.png',
        alt: 'Go to home page',
        link: '/',
    },
    {
        img: 'https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853c849ec3735b52cef9_notes.png',
        alt: 'Go to blog',
        link: {
            en: '/blog/react/publish-report-testing-react',
            es: '/blog/react/publicar-reporte-pruebas-react',
            gl: '/blog/react/publicar-informe-probas-react',
        },
    },
    {
        img: 'https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ff487808618142bfa_terminal.png',
        alt: 'Go to terminal',
        link: '/comments',
    },
    {
        img: 'https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853f10f5994a4d27b0aa_system-preferences.png',
        alt: 'Got to configuration page',
        link: '/settings',
    },
];
