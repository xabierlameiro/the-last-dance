import { themes } from '@storybook/theming';
import { reactIntl } from './reactIntl.js';
import '../styles/globals.css';

export const parameters = {
    reactIntl,
    locale: reactIntl.defaultLocale,
    locales: reactIntl.locales,
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    docs: {
        theme: themes.light,
    },
};

export const decorators = [
    (Story) => (
        <div
            style={{
                padding: '3em',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px 0 rgb(31 38 135 / 37%)',
                borderRadius: '10px',
            }}
        >
            <Story />
        </div>
    ),
];
