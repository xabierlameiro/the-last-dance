import { addons } from 'storybook/manager-api';
// `storybook/theming/create` is the public entry point from Storybook 9 onwards. This used to be
// `storybook/internal/theming/create` — an internal path, taken because the installed
// `@storybook/theming` was 6.5.16 and shipped no declarations for `create`, so the published
// import resolved to `any`. That workaround ends with the v6 packages: the fix its comment
// predicted (bump, then use the supported path) is what this is.
import { create } from 'storybook/theming/create';

/**
 * SDD-L11-T7. `YourTheme.js` folded in — a nine-line theme literal in its own file, imported once.
 *
 * `addons` came from `@storybook/addons` (a Storybook **6** package), then from
 * `@storybook/manager-api`, and now from `storybook/manager-api` — the same API following the
 * packaging as Storybook consolidated it into one module.
 *
 * T7 recorded that the two v6 packages could not simply be dropped: `@storybook/addons@6.5.16` was
 * also required by `storybook-react-intl@1.1.3` and by `@storybook/testing-library@0.0.13`, and
 * both dragged `@storybook/theming@6.5.16` along, so removing the direct devDependencies would
 * only have hidden them. The Storybook 10 upgrade removes the packages that held them: the addon
 * is now `storybook-react-intl@10.2.2`, which depends on `storybook-i18n@^10` and not on
 * `@storybook/addons` at all, and `@storybook/testing-library` is deleted outright (last release
 * October 2023, superseded by `storybook/test`, imported nowhere here).
 * `npm ls @storybook/addons @storybook/theming @storybook/testing-library` now prints `(empty)`,
 * which is the check worth repeating — a missing devDependency line proves nothing on its own.
 */
const theme = create({
    base: 'light',
    brandTitle: 'Return to home page',
    brandUrl: 'https://xabierlameiro.com',
    brandImage: 'https://xabierlameiro.com/favicon.png',
    brandTarget: '_self',
});

addons.setConfig({
    theme,
    panelPosition: 'right',
});
