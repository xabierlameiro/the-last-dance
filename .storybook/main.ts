import type { StorybookConfig } from '@storybook/nextjs';

/**
 * SDD-L11-T7.
 *
 * `build-storybook` was failing before this phase with
 * `TypeError: The 'compilation' argument must be an instance of Compilation`, and the cause is
 * worth recording here because the fix lives in package.json rather than in this file.
 *
 * Two webpack instances were in play. `@storybook/nextjs` declares `webpack` as a peer dependency
 * and imports it as ESM, resolving the project's own copy; Next builds its compiler from the copy
 * it bundles at `next/dist/compiled/webpack`. A `DefinePlugin` from the first was handed to a
 * `Compilation` from the second, and `instanceof` fails across module instances. Next's
 * `server/require-hook` exists to prevent exactly this — its comment says it is "needed for
 * userland plugins to attach to the same webpack instance" — but it patches CommonJS resolution
 * only, so Storybook's ESM import walks straight past it.
 *
 * The scripts therefore run Storybook with `NEXT_PRIVATE_LOCAL_WEBPACK=1`, which is Next's own
 * switch for using the installed webpack instead of its bundled one. That leaves a single instance,
 * the project's, which is the one `@storybook/nextjs` asked for in its peer dependency. It is a
 * `NEXT_PRIVATE_*` flag, so treat it as version-sensitive: if a Next upgrade brings the error back,
 * this is the first place to look. `next build` is deliberately left alone and keeps using the
 * bundled copy.
 */
const config: StorybookConfig = {
    // 'button--primary' is a story id, not a glob, and matches nothing. Kept because removing it is
    // a behaviour change and this phase is a migration; it belongs in a tidy-up commit.
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

export default config;
