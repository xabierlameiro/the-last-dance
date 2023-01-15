export const domain = 'https://xabierlameiro.com';
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
    },
    {
        href: 'https://github.com/xabierlameiro',
        title: 'Github profile',
        name: 'Github',
    },
    {
        href: 'https://www.reddit.com/user/xlameiro',
        title: 'Reddit profile',
        name: 'Reddit',
    },
];

export const translateRoute = (pathname: string, f: Function) => {
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
