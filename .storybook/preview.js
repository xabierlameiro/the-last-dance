import { themes } from '@storybook/theming';

export const parameters = {
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    docs: {
        theme: themes.dark,
    },
};
