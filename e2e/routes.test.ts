import { expect, test } from './fixtures';

/**
 * SDD-L10-T6. One spec per route family.
 *
 * The e2e suite covered exactly one of ten route families — the landing page — with two real
 * assertions between them. Everything else, including every page that renders MDX and every locale
 * prefix, was exercised only by the unit suite, which mocks the router and the intl provider and so
 * cannot see routing or translation at all.
 *
 * These are deliberately shallow: one load-bearing assertion each, on the thing that would actually
 * be broken if the route regressed. Depth belongs in the unit suite; breadth is what was missing.
 */

test.describe('Blog', () => {
    test('should redirect /blog to the newest post', async ({ page }) => {
        await page.goto('/blog');

        // /blog is a redirect, not a page — it resolves to the newest post in the active locale so
        // the Dock never points at a slug that ages out.
        await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+\/.+/);
        await expect(page.getByTestId('article-panel')).toBeVisible();
    });

    test('should render a post with its taxonomy panels', async ({ page }) => {
        await page.goto('/blog');

        // Two nav-lists: categories and tags. Asserted attached rather than visible because SDD-L05
        // documented that both panels collapse to 10px rails below 900px — "visible" is a viewport
        // question, "present" is the routing question this spec is about.
        await expect(page.getByTestId('nav-list').first()).toBeAttached();
        await expect(page.getByTestId('aside-panel')).toBeAttached();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should reach a category listing from the sidebar', async ({ page }) => {
        await page.goto('/blog');

        const firstCategory = page.getByTestId('nav-list').getByRole('link').first();
        const href = await firstCategory.getAttribute('href');
        await firstCategory.click();

        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByTestId('article-panel')).toBeVisible();
    });
});

test.describe('Static pages', () => {
    test('should render /settings', async ({ page }) => {
        await page.goto('/settings');

        await expect(page.getByRole('heading', { level: 1 })).toHaveText('System Preferences');
        await expect(page.getByTestId('grid-layout-control')).toBeVisible();
        await expect(page.getByTestId('icon-with-name').first()).toBeVisible();
    });

    test('should render /survey and advance on an answer', async ({ page }) => {
        await page.goto('/survey');

        // The intro question, with its single "Yes".
        await expect(page.getByTestId('question-block')).toContainText('thanks for getting in touch');
        await expect(page.getByRole('radio')).toHaveCount(1);

        // The radio input has zero height — the label is the visible control, which is why `.check()`
        // on the input times out. Clicking the label is also what a reader does.
        await page.getByText('Yes', { exact: true }).click();

        // Answering advances: the block is replaced by the next question, so asserting the first
        // radio stayed checked would be asserting a control that no longer exists.
        await expect(page.getByTestId('question-block')).toContainText('The role is for a profile');
        await expect(page.getByRole('radio')).toHaveCount(3);
    });

    test('should render /comments', async ({ page }) => {
        await page.goto('/comments');

        await expect(page.getByTestId('dialog')).toBeVisible();
    });

    test('should render a legal document and mark the current one', async ({ page }) => {
        await page.goto('/legal/privacy-policy');

        await expect(page.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('aria-current', 'page');
        // SDD-L08: the selection came from `useState(0)` before, so a direct load highlighted the
        // first item — "Cookies Policy" — whichever document was actually open.
        await expect(page.getByRole('link', { name: /Cookies Policy/i })).not.toHaveAttribute('aria-current', 'page');
    });

    test('should serve a 404 with a way out', async ({ page }) => {
        const response = await page.goto('/this-route-does-not-exist');

        expect(response?.status()).toBe(404);
        await expect(page.getByRole('link', { name: /home page/i })).toBeVisible();
    });
});

/**
 * `/api/indexed-pages` sat in Search Console's "Crawled - currently not indexed" because
 * nothing ever told Google to skip the API surface. Asserted here rather than in the unit suite
 * because the directive is a `next.config.js` header — it exists only in a served response.
 */
test.describe('Index hygiene', () => {
    test.describe.configure({ mode: 'parallel' });

    // `/api/indexed-pages` is the route Search Console actually crawled. The unrouted paths are the
    // stronger assertion: the header comes from a `/api/:path*` rule, so it covers the whole
    // namespace — including any route added later — rather than the handlers that exist today.
    //
    // Deliberately not a route that calls a third party (`/api/github-stars` reaches GitHub): the
    // assertion is about a response header, and waiting on someone else's API to read it is how a
    // header test turns into a flaky network test.
    for (const path of ['/api/indexed-pages', '/api/does-not-exist', '/api/nested/unrouted/path']) {
        test(`should keep ${path} out of the index`, async ({ request }) => {
            expect((await request.get(path)).headers()['x-robots-tag']).toBe('noindex, nofollow');
        });
    }

    test('should leave the blog itself indexable', async ({ request }) => {
        // The rule is scoped to /api. A wildcard here would silently de-index the whole site, and
        // that failure would be invisible until traffic disappeared.
        for (const path of ['/', '/es', '/blog/nextjs/dark-theme']) {
            expect((await request.get(path)).headers()['x-robots-tag'], `${path} must stay indexable`).toBeUndefined();
        }
    });
});

/**
 * The feeds are static files generated at prebuild, so a unit test could only assert that
 * the generator's output matches the generator's own logic. What actually has to hold is served
 * behaviour: that the build emitted them, that next.config.js overrode Vercel's text/xml, and that
 * the links inside resolve — the last one matters because PR #164 made cross-locale post URLs 404,
 * and a feed pointing at one would hand every subscriber a dead link.
 */
test.describe('RSS feeds', () => {
    test.describe.configure({ mode: 'parallel' });

    const FEEDS = {
        '/feed.xml': { language: 'en', link: 'https://xabierlameiro.com' },
        '/feed.es.xml': { language: 'es', link: 'https://xabierlameiro.com/es' },
        '/feed.gl.xml': { language: 'gl', link: 'https://xabierlameiro.com/gl' },
    };

    for (const [path, { language, link }] of Object.entries(FEEDS)) {
        test(`should serve ${path} as RSS 2.0 for ${language}`, async ({ request }) => {
            const response = await request.get(path);

            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toContain('application/rss+xml');

            const body = await response.text();
            expect(body).toContain('<rss version="2.0"');
            expect(body).toContain(`<language>${language}</language>`);
            expect(body).toContain(`<link>${link}</link>`);
            // One item per post in this locale, each with the guid readers key "already seen" off.
            expect(body.match(/<item>/g)).toHaveLength(15);
            expect(body.match(/<guid isPermaLink="true">/g)).toHaveLength(15);
        });
    }

    test('should only link post URLs that actually resolve', async ({ request }) => {
        const body = await (await request.get('/feed.xml')).text();
        const links = [...body.matchAll(/<link>(https:\/\/xabierlameiro\.com\/blog\/[^<]+)<\/link>/g)].map(
            ([, url]) => new URL(url).pathname
        );

        expect(links.length).toBe(15);
        for (const pathname of links) {
            expect((await request.get(pathname)).status(), `${pathname} should not be a dead link`).toBe(200);
        }
    });

    test('should not carry a noindex directive on the feeds themselves', async ({ request }) => {
        // The /api/:path* rule must not bleed onto anything a reader subscribes to.
        const response = await request.get('/feed.xml');

        expect(response.headers()['x-robots-tag']).toBeUndefined();
    });

    test('should advertise the locale feed for autodiscovery', async ({ page }) => {
        await page.goto('/es');

        await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
            'href',
            '/feed.es.xml'
        );
    });
});

/**
 * Locale switching was untested at every level. The unit suite cannot see it — the router mock has
 * no `locale`, and the intl mock returns message ids rather than translations — so nothing in the
 * project verified that the three locale prefixes serve three different languages.
 */
test.describe('Locales', () => {
    test.describe.configure({ mode: 'parallel' });

    const HOME_TITLE = {
        '/': /microcomputing and networks Technician/,
        '/es': /técnico en microinformática y redes/,
        '/gl': /técnico en microinformática e redes/,
    };

    for (const [path, title] of Object.entries(HOME_TITLE)) {
        test(`should serve the home page in the locale of ${path}`, async ({ page }) => {
            await page.goto(path);

            await expect(page).toHaveTitle(title);
        });
    }

    test('should keep the locale when closing Settings', async ({ page }) => {
        await page.goto('/es/settings');

        await page.getByTestId('close').click();

        // SDD-L08: this was `window.location.href = '/'` — a full reload to the *English* home, so
        // closing Settings silently dropped the visitor's language.
        await expect(page).toHaveURL(/\/es$/);
    });

    test('should set the html lang attribute per locale', async ({ page }) => {
        await page.goto('/gl');

        await expect(page.locator('html')).toHaveAttribute('lang', 'gl');
    });
});
