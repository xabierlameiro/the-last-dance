export const MAX_STEPS = 10;
export const defaultLocale = 'en';
export const author = 'Xabier Lameiro Cardama';
export const socialNetworks = [
    'https://www.linkedin.com/in/xlameiro',
    'https://github.com/xabierlameiro',
    'https://www.reddit.com/user/xlameiro',
];

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

export const translateRoute = (pathname: string, t: Function) => {
    let route = '';
    switch (pathname) {
        case '/':
            route = t('home.breadcrumb');
            break;
        case '/blog/[category]/[slug]':
            route = t('blog.breadcrumb');
            break;
        case '/legal/[slug]':
            route = t('legal.breadcrumb');
            break;
        case '/comments':
            route = t('comments.breadcrumb');
            break;
        case '/settings':
            route = t('settings.breadcrumb');
            break;
    }
    return route;
};
