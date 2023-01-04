export default {
    stories: ['button--primary', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-react-intl',
    ],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    docs: {
        docsPage: false,
    },
    staticDirs: ['../public'],
};
