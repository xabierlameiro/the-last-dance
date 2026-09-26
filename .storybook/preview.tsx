import type { Preview } from '@storybook/react';
// `storybook/theming`, not `@storybook/theming`: the standalone package stopped at 6.5.16 and the
// theming API lives inside `storybook` itself from 9 onwards. While the old package was installed
// this import silently resolved to the v6 copy and paired a v6 theme object with a v8 manager.
import { themes } from 'storybook/theming';
import { messages } from '../src/intl/translations';
import '../styles/globals.css';

/**
 * SDD-L11-T7. `.tsx`, not `.ts`: the decorator below returns JSX.
 *
 * `reactIntl.js` folded in here — it existed only to build this object, and splitting a four-field
 * literal across a second file cost a reader one more hop than it bought.
 */
const reactIntl = {
    defaultLocale: 'en',
    locales: ['en', 'es', 'gl'],
    messages,
    formats: {},
};

const preview: Preview = {
    parameters: {
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
    },
    decorators: [
        (Story) => (
            <div
                style={{
                    padding: '3em',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px 0 rgb(31 38 135 / 37%)',
                    borderRadius: '10px',
                    position: 'relative',
                }}
            >
                <Story />
            </div>
        ),
    ],
    globalTypes: {
        locale: {
            name: 'Locale',
            description: 'Internationalization locale',
            defaultValue: 'en',
            toolbar: {
                icon: 'globe',
                items: [
                    { value: 'en', right: '🇺🇸', title: 'English' },
                    { value: 'es', right: '🇪🇸', title: 'Español' },
                    { value: 'gl', right: '🇪🇸', title: 'Galego' },
                ],
            },
        },
    },
};

export default preview;
