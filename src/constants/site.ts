import type { IntlShape } from 'react-intl';

export const MAX_STEPS = 10;
export const defaultLocale = 'en';
// SDD-004 A1: one canonical name form everywhere; the full legal name stays as alternateName
export const author = 'Xabier Lameiro';
export const authorAlternateName = 'Xabier Lameiro Cardama';
export const socialNetworks = [
    'https://www.linkedin.com/in/xlameiro',
    'https://github.com/xabierlameiro',
    'https://www.reddit.com/user/xlameiro',
    'https://x.com/xlameirodev',
];

// The Person JSON-LD renders from _document, which sits outside the IntlProvider and so cannot
// use useIntl() — hence a plain map keyed by locale rather than a translation id. Schema.org
// *vocabulary* stays English by design, but text values must match the language of the page they
// describe: Google requires structured data to be a true representation of the visible content,
// and it infers page language from that content, not from `lang` or the URL.
export const personDescription: Record<string, string> = {
    en: 'Software architect from Galicia, Spain. Builds web products for the banking and retail sectors — CaixaBank, Openbank and Inditex — working mainly with React, Next.js and TypeScript, with a strong interest in testing, automation and the IoT.',
    es: 'Arquitecto de software gallego. Desarrolla productos web para los sectores bancario y retail —CaixaBank, Openbank e Inditex— trabajando sobre todo con React, Next.js y TypeScript, con especial interés en testing, automatización y el IoT.',
    gl: 'Arquitecto de software galego. Desenvolve produtos web para os sectores bancario e retail —CaixaBank, Openbank e Inditex— traballando sobre todo con React, Next.js e TypeScript, con especial interese en testing, automatización e o IoT.',
};

export const socialLinks = [
    {
        href: 'https://www.linkedin.com/in/xlameiro',
        title: 'Linkedin profile',
        name: 'Linkedin',
        testId: 'linkedin-link',
    },
    {
        href: 'https://github.com/xabierlameiro',
        title: 'Github profile',
        name: 'Github',
        testId: 'github-link',
    },
    {
        href: 'https://www.reddit.com/user/xlameiro',
        title: 'Reddit profile',
        name: 'Reddit',
        testId: 'reddit-link',
    },
    {
        href: 'https://storybook.xabierlameiro.com',
        title: 'Storybook',
        name: 'Storybook',
        testId: 'storybook-link',
    },
    {
        href: 'https://docs.xabierlameiro.com',
        title: 'Docs',
        name: 'Docs',
        testId: 'docs-link',
    },
    {
        href: 'https://coverage.xabierlameiro.com',
        title: 'Coverage',
        name: 'Coverage',
        testId: 'coverage-link',
    },
    {
        href: 'https://e2e.xabierlameiro.com',
        title: 'e2e',
        name: 'e2e',
        testId: 'e2e-link',
    },
    {
        href: 'https://performance.xabierlameiro.com',
        title: 'Lighthouse',
        name: 'Lighthouse',
        testId: 'lighthouse-link',
    },
];

export const translateRoute = (pathname: string, f: IntlShape['formatMessage']) => {
    let route = '';
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
    return route;
};
