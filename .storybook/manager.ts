import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

/**
 * SDD-L11-T7. `YourTheme.js` folded in — a nine-line theme literal in its own file, imported once.
 *
 * `addons` now comes from `@storybook/manager-api`. It used to come from `@storybook/addons`, a
 * Storybook **6** package sitting in the dependency tree next to 8.6.18 everywhere else; that
 * package is the v6 name for this API and has no business in an 8.x manager.
 *
 * The two v6 packages stay installed, and deliberately so rather than by neglect: `npm ls` shows
 * `@storybook/addons@6.5.16` is also required by `storybook-react-intl` (an addon this project
 * loads) and by `@storybook/testing-library`, and both drag `@storybook/theming@6.5.16` with them.
 * Dropping our direct devDependencies would not remove either package — it would only hide that
 * they are still there. Getting rid of them means replacing `storybook-react-intl`, which is a
 * dependency decision, not a migration step.
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
