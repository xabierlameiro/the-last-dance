import { remarkCodeHike } from '@code-hike/mdx';
import remarkGfm from 'remark-gfm';
import fullTheme from 'shiki/themes/one-dark-pro.json' with { type: 'json' };

/**
 * SDD-L09, T1 + T7 + T8. The MDX rules, in one module both pipelines import.
 *
 * This project compiles MDX two ways: `@next/mdx` for `.mdx` files imported as pages (today that is
 * exactly one, `data/comments/index.mdx`), and `next-mdx-remote` for the blog and legal documents.
 * Each had its own plugin array, and they disagreed — `next-mdx-remote` had remark-gfm, `@next/mdx`
 * did not — so a GFM table rendered in a blog post and as literal pipe characters in an MDX page,
 * with nothing to tell an author which set of rules applied to the file in front of them. The
 * `serialize`/`serializePath` pair had a third and fourth copy of the array between them, each
 * commented "See serializePath": noticed, documented, not removed.
 *
 * SDD-L11-T6. This was `.mjs`, with a note explaining that `next.config.js` is loaded by Node
 * directly and therefore could not import a `.ts` module. That constraint died with the config's
 * own migration: Next loads `next.config.ts` through `next/dist/build/next-config-ts`, which
 * registers `require.extensions` hooks for `.ts`, `.mts` and `.mjs` and runs every module the
 * config pulls in through SWC. The transitive import is transpiled the same way the config is.
 *
 * ## The theme, trimmed (T1)
 *
 * `one-dark-pro.json` used to be passed whole, and Code Hike serialises the theme it is given into
 * every compiled MDX module. A representative post's `compiledSource` measured **413,890
 * characters**, and ~47 KB of that was this file: 264 `tokenColors` entries plus the complete VS
 * Code **UI** colour map — 137 keys covering `activityBar`, `debugToolBar`, `dropdown`,
 * `notificationCenter`. None of them paint anything here; there is no editor chrome on a blog post.
 *
 * Code Hike reads 24 UI colour keys, listed below (taken from its `dist/index.cjs.js`, not guessed);
 * this theme defines 17 of them. Keeping those and dropping the other 120 takes `colors` from 5,256
 * characters to 613.
 *
 * `tokenColors` stays whole. It is the larger half, but every entry is a scope→colour rule that
 * could match a token in a code block, and pruning it would mean deciding which languages this blog
 * is allowed to publish. It is hoisted once per compiled module rather than repeated per block
 * (verified: `tokenColors` occurs once in the output, not six times), so it is a fixed cost.
 *
 * `semanticTokenColors` is dropped too: shiki 0.10 tokenises with TextMate grammars and never reads
 * it.
 */
const CODE_HIKE_UI_COLOUR_KEYS = [
    'editor.background',
    'editor.foreground',
    'editor.infoForeground',
    'editor.lineHighlightBackground',
    'editor.rangeHighlightBackground',
    'editor.selectionBackground',
    'editor.selectionHighlightBackground',
    'editorGroup.border',
    'editorGroupHeader.tabsBackground',
    'editorLineNumber.foreground',
    'icon.foreground',
    'input.background',
    'input.border',
    'input.foreground',
    'list.activeSelectionBackground',
    'list.activeSelectionForeground',
    'list.hoverBackground',
    'list.hoverForeground',
    'tab.activeBackground',
    'tab.activeBorder',
    'tab.activeForeground',
    'tab.border',
    'tab.inactiveBackground',
    'tab.inactiveForeground',
];

const themeColours: Record<string, string> = fullTheme.colors;

export const theme = {
    name: fullTheme.name,
    type: fullTheme.type,
    tokenColors: fullTheme.tokenColors,
    colors: Object.fromEntries(
        CODE_HIKE_UI_COLOUR_KEYS.filter((key) => themeColours[key] !== undefined).map((key) => [
            key,
            themeColours[key],
        ]),
    ),
};

/**
 * The plugin array, for a given pipeline.
 *
 * `singleTilde: false` so "~1M"-style approximations in prose can never pair up into accidental
 * strikethrough.
 *
 * `autoImport` is the one option that legitimately differs, and it took a broken build to establish
 * that rather than an argument: unifying it to `false` made `@next/mdx` compile
 * `data/comments/index.mdx` without the `CH` import it needs, and the build failed with "Expected
 * object `CH` to be defined". `@next/mdx` produces a real module, so Code Hike can inject that
 * import itself; `next-mdx-remote` compiles a fragment with no module scope, so `CH` has to arrive
 * through the components prop instead and the auto-import would emit a statement that cannot run.
 *
 * Everything else — the theme and the GFM rules — is shared, which is the part that was drifting.
 *
 * The return type is inferred rather than annotated `PluggableList`, against this repo's habit of
 * typing exports explicitly, and the two `as` assertions are what make that work. Two copies of
 * `unified` are installed — the top-level one and `remark-rehype/node_modules/unified` — with
 * structurally incompatible `Plugin` types, so annotating with either copy breaks the consumer
 * using the other: `next.config.ts` feeds this to `@next/mdx`, `helpers/mdx.ts` to
 * `next-mdx-remote`. The assertions only pin each entry as the two-element tuple it already is,
 * which TypeScript would otherwise widen to a union array that satisfies neither copy. They state
 * the shape of the value, not a claim about whose `Plugin` type it is.
 *
 * This surfaced only on the migration: as `.mjs` the module sat outside the compiler's scope, so
 * the conflict existed and was simply unseen.
 */
export const remarkPlugins = ({ autoImport }: { autoImport: boolean }) => [
    [remarkGfm, { singleTilde: false }] as [typeof remarkGfm, { singleTilde: boolean }],
    [remarkCodeHike, { autoImport, theme }] as [typeof remarkCodeHike, { autoImport: boolean; theme: typeof theme }],
];
