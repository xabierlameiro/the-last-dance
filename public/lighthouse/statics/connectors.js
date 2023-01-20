// fix arrow end issues:
// https://github.com/DmitryBaranovskiy/raphael/issues/471

var chart_config = {
    chart: {
        container: '#OrganiseChart-big-commpany',
        levelSeparation: 40,
        siblingSeparation: 20,
        subTeeSeparation: 30,
        rootOrientation: 'NORTH',
        nodeAlign: 'BOTTOM',

        connectors: {
            type: 'step',
            style: {
                'stroke-width': 2,
            },
        },
        node: {
            HTMLclass: 'big-commpany',
        },
    },

    nodeStructure: {
        // Domain
        text: { name: 'xabierlameiro.com' },
        HTMLclass: 'domain',
        drawLineThrough: true,
        collapsable: true,
        connectors: {
            style: {
                stroke: 'blue',
                'arrow-end': 'oval-wide-long',
            },
        },
        children: [
            // Home page
            {
                text: { name: '/' },

                link: {
                    href: 'https://xabierlameiro.com/lighthouse/xabierlameiro.com.html',
                },
                stackChildren: true,
                connectors: {
                    style: {
                        stroke: '#8080FF',
                        'arrow-end': 'block-wide-long',
                    },
                },
            },
            // Blog
            {
                text: { name: '/blog' },
                drawLineThrough: true,
                collapsable: true,
                connectors: {
                    style: {
                        stroke: 'green',
                        'arrow-start': 'classic-wide-long',
                    },
                },
                children: [
                    // Topics
                    {
                        text: { name: 'Topics' },
                        connectors: {
                            style: {
                                stroke: 'green',
                                'arrow-start': 'classic-wide-long',
                            },
                        },

                        children: [
                            // Error
                            {
                                text: { name: '/error' },
                                stackChildren: true,

                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/solve-address-in-use-error' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/solve-address-in-use-error.html',
                                        },
                                    },
                                    {
                                        text: {
                                            name: '/npm-token-solution-error',
                                        },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/npm-token-solution-error.html',
                                        },
                                    },
                                    {
                                        text: { name: '/uncaught-error-minified-react-error' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/uncaught-error-minified-react-error.html',
                                        },
                                    },
                                ],
                            },
                            // React
                            {
                                text: { name: '/react' },
                                stackChildren: true,

                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/how-document-my-react-components-with-jsdoc' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/how-document-my-react-components-with-jsdoc.html',
                                        },
                                    },
                                    {
                                        text: {
                                            name: '/publish-report-testing-react',
                                        },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/publish-report-testing-react.html',
                                        },
                                    },
                                    {
                                        text: { name: '/deploying-my-storybook-is-very-simple' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/deploying-my-storybook-is-very-simple.html',
                                        },
                                    },
                                ],
                            },
                            // Nextjs
                            {
                                text: { name: '/nextjs' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/counter-for-github-stars-repository' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/counter-for-github-stars-repository.html',
                                        },
                                    },
                                    {
                                        text: {
                                            name: '/make-a-views-counter-with-google-analytics',
                                        },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/make-a-views-counter-with-google-analytics.html',
                                        },
                                    },
                                    {
                                        text: { name: '/translate-slugs-web-pages' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/translate-slugs-web-pages.html',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    // Tags
                    {
                        text: { name: 'Tags' },
                        connectors: {
                            style: {
                                stroke: 'green',
                                'arrow-start': 'classic-wide-long',
                            },
                        },
                        children: [
                            // Node
                            {
                                text: { name: '/node' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/solve-address-in-use-error' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/solve-address-in-use-error.html',
                                        },
                                    },
                                    {
                                        text: {
                                            name: '/how-document-my-react-components-with-jsdoc',
                                        },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/how-document-my-react-components-with-jsdoc.html',
                                        },
                                    },
                                    {
                                        text: { name: '/counter-for-github-stars-repository' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/counter-for-github-stars-repository.html',
                                        },
                                    },
                                    {
                                        text: { name: '/make-a-views-counter-with-google-analytics' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/make-a-views-counter-with-google-analytics.html',
                                        },
                                    },
                                    {
                                        text: { name: '/uncaught-error-minified-react-error' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/uncaught-error-minified-react-error.html',
                                        },
                                    },
                                ],
                            },
                            // Npm
                            {
                                text: { name: '/npm' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/npm-token-solution-error' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/npm-token-solution-error.html',
                                        },
                                    },
                                ],
                            },
                            {
                                text: { name: '/jest' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/publish-report-testing-react' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/publish-report-testing-react.html',
                                        },
                                    },
                                ],
                            },
                            {
                                text: { name: '/storybook' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/deploying-my-storybook-is-very-simple' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/deploying-my-storybook-is-very-simple.html',
                                        },
                                    },
                                ],
                            },
                            {
                                text: { name: '/intl' },
                                stackChildren: true,
                                connectors: {
                                    stackIndent: -62,
                                    style: {
                                        stroke: 'green',
                                        'arrow-end': 'block-wide-long',
                                    },
                                },
                                children: [
                                    {
                                        text: { name: '/translate-slugs-web-pages' },
                                        link: {
                                            href: 'https://xabierlameiro.com/lighthouse/translate-slugs-web-pages.html',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Comments
            {
                text: { name: '/comments' },
                link: {
                    href: 'https://xabierlameiro.com/lighthouse/comments.html',
                },
                stackChildren: true,
                connectors: {
                    style: {
                        stroke: '#8080FF',
                        'arrow-end': 'block-wide-long',
                    },
                },
            },
            // Legal
            {
                text: { name: '/legal' },
                drawLineThrough: true,
                collapsable: true,
                stackChildren: true,
                connectors: {
                    stackIndent: 30,
                    style: {
                        stroke: '#E3C61A',
                        'arrow-end': 'block-wide-long',
                    },
                },
                children: [
                    {
                        text: { name: '/cookies-policy' },
                        link: {
                            href: 'https://xabierlameiro.com/lighthouse/cookies-policy.html',
                        },
                    },
                    {
                        text: { name: '/legal-notice' },
                        link: {
                            href: 'https://xabierlameiro.com/lighthouse/legal-notice.html',
                        },
                    },
                    {
                        text: { name: '/privacy-policy' },
                        link: {
                            href: 'https://xabierlameiro.com/lighthouse/privacy-policy.html',
                        },
                    },
                ],
            },
            // Settings
            {
                text: { name: '/settings' },
                link: {
                    href: 'https://xabierlameiro.com/lighthouse/settings.html',
                },
            },
        ],
    },
};
