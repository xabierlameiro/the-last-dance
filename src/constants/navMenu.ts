/**
 * SDD-L08: `alt` was five hardcoded English strings — including the typo 'Got to configuration
 * page' — on a site that ships in three languages. They are message ids now, resolved by `Dock`.
 *
 * The label is not only for assistive tech. These icons carry no text, and their only visible cue
 * was a `title` tooltip plus a CSS hover state behind `@media (hover: hover)` — which never matches
 * on a touch device. So on a phone the Dock is five unlabelled pictures and nothing else, which is
 * why `Dock` now renders the label as text under each icon.
 */
/** An entry inside a Dock folder. Always a real route of its own, never a panel-only destination. */
export type Tool = {
    labelId: string;
    link: string;
    testId: string;
};

/**
 * SDD-015: the two CLI pages live in a folder rather than in two Dock slots. Measured on production
 * at 320px, the Dock is 310px wide with six apps at 48px; a seventh does not fit, and shrinking the
 * icons below 44px would put them under the minimum touch target. macOS answers this with a folder,
 * so this does too — and the next tool costs a line here instead of another slot.
 */
export const tools: Array<Tool> = [
    {
        labelId: 'dock.nextLeak',
        link: '/next-leak',
        testId: 'next-leak',
    },
    {
        labelId: 'dock.nextCoverage',
        link: '/next-coverage',
        testId: 'next-coverage',
    },
];

type Item = {
    img: string;
    labelId: string;
    /**
     * A shorter label for touch devices, where every label is visible at once. Each slot is 60px and
     * the labels do not wrap, so the full names ran into their neighbours ("Legal documents" is 86px
     * wide at 10px). The full label is still the link's accessible name and its hover label.
     */
    shortLabelId?: string;
    /** Absent on a folder, which opens a panel instead of navigating anywhere itself. */
    link?: { en: string; es: string; gl: string } | string;
    testId: string;
    /** Present only on a folder. Its entries are rendered as anchors in the server HTML. */
    tools?: Array<Tool>;
};

export const menu: Array<Item> = [
    {
        img: '/menu/vscode.png',
        labelId: 'dock.home',
        link: '/',
        testId: 'home',
    },
    {
        img: '/menu/notes.png',
        labelId: 'dock.blog',
        // /blog redirects to the newest post in the active locale, so the Dock never points at a
        // slug that ages out (or 404s once that post is renamed). Link carries the current locale.
        link: '/blog',
        testId: 'blog',
    },
    {
        img: '/menu/terminal.png',
        labelId: 'dock.terminal',
        link: '/comments',
        testId: 'terminal',
    },
    {
        img: '/menu/books.png',
        labelId: 'dock.legal',
        shortLabelId: 'dock.legal.short',
        link: '/legal/cookies-policy',
        testId: 'legal',
    },
    {
        img: '/menu/settings.png',
        labelId: 'dock.settings',
        shortLabelId: 'dock.settings.short',
        link: '/settings',
        testId: 'settings',
    },
    {
        img: '/menu/tools.png',
        labelId: 'dock.tools',
        testId: 'tools',
        tools,
    },
];
