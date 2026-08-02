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

/**
 * SDD-L12-T2 (decision D5). This list used to carry five more entries — Storybook, Docs, Coverage,
 * e2e and Lighthouse, the artifact subdomains. Together with the widgets, the header needed 1526 px
 * of content at every viewport: 246 px of it unreachable on a 1280 px laptop and roughly 1150 px on
 * a phone, since `.header` is a 24 px strip with `overflow: scroll`. Widgets sat off-screen with a
 * horizontal drag as their only affordance, which is what a reader reported on 2026-07-30.
 *
 * Removing them also removes five followed outbound links from every page, which is the other half
 * of decision D2 (`coverage.` is `noindex`ed separately). The subdomains are still published and
 * still linked from the docs that reference them — they simply no longer ride on every page.
 */
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
