import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * SDD-L10-T7. The automated check that holds SDD-L05 and SDD-L06 in place.
 *
 * Those two phases fixed keyboard operability, landmarks, focus visibility, contrast, dialog
 * semantics and reduced motion — and nothing in the repository could tell if any of it regressed.
 * The unit suite mocks the router and the intl provider, so it cannot see a page; the e2e suite had
 * two assertions in total.
 *
 * Axe does not certify a page as accessible, and this is not claiming it does: it catches the
 * machine-checkable subset, which is roughly a third of WCAG. What it *does* catch is the class of
 * regression those phases were about — a missing label, a lost landmark, a contrast pair dropping
 * below 4.5:1 — and it catches them on the four distinct window layouts this site has.
 */

// The tags that map to the bar SDD-L05/L06 set, rather than axe's defaults (which include
// best-practice rules this site deliberately does not follow, like the macOS-metaphor list markup).
const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const PAGES = [
    { name: 'home', path: '/' },
    { name: 'settings', path: '/settings' },
    { name: 'survey', path: '/survey' },
    { name: 'blog post', path: '/blog' },
];

for (const { name, path } of PAGES) {
    test(`should have no serious or critical accessibility violations on the ${name} layout`, async ({ page }) => {
        await page.goto(path);

        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();

        const blocking = violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));

        // The failure message has to name the rule and the node, or a red build tells you nothing.
        expect(
            blocking.map((violation) => ({
                id: violation.id,
                impact: violation.impact,
                nodes: violation.nodes.map((node) => node.target.join(' ')),
            }))
        ).toEqual([]);
    });
}
