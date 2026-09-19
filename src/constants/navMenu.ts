/**
 * SDD-L08: `alt` was five hardcoded English strings — including the typo 'Got to configuration
 * page' — on a site that ships in three languages. They are message ids now, resolved by `Dock`.
 *
 * The label is not only for assistive tech. These icons carry no text, and their only visible cue
 * was a `title` tooltip plus a CSS hover state behind `@media (hover: hover)` — which never matches
 * on a touch device. So on a phone the Dock is five unlabelled pictures and nothing else, which is
 * why `Dock` now renders the label as text under each icon.
 */
type Item = {
    img: string;
    labelId: string;
    /**
     * A shorter label for touch devices, where every label is visible at once. Each slot is 60px and
     * the labels do not wrap, so the full names ran into their neighbours ("Legal documents" is 86px
     * wide at 10px). The full label is still the link's accessible name and its hover label.
     */
    shortLabelId?: string;
    link: { en: string; es: string; gl: string } | string;
    testId: string;
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
        img: '/menu/next-leak.png',
        labelId: 'dock.nextLeak',
        link: '/next-leak',
        testId: 'next-leak',
    },
];
