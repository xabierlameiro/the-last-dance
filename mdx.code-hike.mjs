/*
 * Turbopack serialises the `@next/mdx` loader options, so `next.config.ts` names each remark plugin by
 * a string that the loader imports itself, taking `module.default || module`. `@code-hike/mdx` has
 * no default export, only the named `remarkCodeHike`; without this module the loader would hand the
 * whole namespace object to unified as if it were the plugin.
 */
export { remarkCodeHike as default } from '@code-hike/mdx';
