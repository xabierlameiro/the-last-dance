import { addons } from '@storybook/manager-api';
// `storybook/internal/…` rather than `@storybook/theming/create`, and the reason is not style:
// the installed `@storybook/theming` is **6.5.16**, whose `create.js` ships no declarations, so
// that import resolved to `any` — and it paired a v6 theme with the v8 `addons` above. This path
// is Storybook 8's own, typed, and matches the manager it configures. It is marked internal, so
// the real fix is bumping `@storybook/theming` to 8.x once an install is possible here; see the
// note below on why the v6 packages cannot simply be dropped.
import { create } from 'storybook/internal/theming/create';

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
