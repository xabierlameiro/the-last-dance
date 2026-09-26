/**
 * @description What Next itself decides the proxy runs on, as opposed to what the raw pattern in
 * `config.matcher` says. `proxy.test.ts` covers the proxy's behaviour once it is invoked; this file
 * covers the step before that, and the two disagree in ways that only this API makes visible.
 *
 * `unstable_doesMiddlewareMatch` is Next's own matcher, given the same `config` object the build
 * reads and the same `i18n` block as `next.config.ts`. It is the closest thing to asking the router
 * the question directly.
 *
 * The name still says "Middleware" on 16.3.6 even though the file convention is now `proxy` — there
 * is no `unstable_doesProxyMatch`. Checked against
 * `next/dist/experimental/testing/server/middleware-testing-utils.d.ts`.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

// `next/experimental/testing/server` pulls in Next's app-render storage, which reads
// `globalThis.AsyncLocalStorage` and throws `Invariant: AsyncLocalStorage accessed in runtime where
// it is not available` under jsdom. The edge runtime and Next's own server provide it as a global;
// jsdom does not, so it is provided here before the module is loaded. This is why every import
// below is dynamic: a static one would be hoisted above this assignment and throw.
(globalThis as unknown as { AsyncLocalStorage: unknown }).AsyncLocalStorage = AsyncLocalStorage;

// Mirrors the `i18n` block in next.config.ts. Duplicated rather than imported because importing the
// config would drag `@next/mdx` and the whole plugin chain into a unit test.
const nextConfig = { i18n: { locales: ['en', 'es', 'gl'], defaultLocale: 'en', localeDetection: false } };

const doesMatch = async (url: string): Promise<boolean> => {
    const { unstable_doesMiddlewareMatch } = await import('next/experimental/testing/server');
    const { config } = await import('../proxy');
    return unstable_doesMiddlewareMatch({ config, url, nextConfig });
};

describe('what Next compiles config.matcher into', () => {
    it('runs on a post in every locale, and on its data request', async () => {
        await expect(doesMatch('https://xabierlameiro.com/blog/error/solve-address-in-use-error')).resolves.toBe(true);
        await expect(doesMatch('https://xabierlameiro.com/es/blog/error/resolver-direccion-en-uso-error')).resolves.toBe(
            true
        );
        await expect(doesMatch('https://xabierlameiro.com/gl/blog/error/arranxar-direccion-en-uso-erro')).resolves.toBe(
            true
        );
        // The `?tag=` rewrite is worthless if it only fires on a full page load; this is the client
        // navigation's request, and it is why `.json` is not in the excluded extension list.
        await expect(
            doesMatch('https://xabierlameiro.com/_next/data/BUILD/es/blog/error/resolver-direccion-en-uso-error.json')
        ).resolves.toBe(true);
    });

    it('does not run on Next internals or static assets', async () => {
        await expect(doesMatch('https://xabierlameiro.com/_next/static/chunks/main.js')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/favicon.ico')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/posts/nextjs-memory-leak.png')).resolves.toBe(false);
    });

    /**
     * Pinned because it is surprising, not because it is wanted. Next wraps the pattern for i18n as
     *
     *   ^(?:\/(_next\/data\/[^/]+))?(?:\/((?!_next\/)[^/.]+))(?:\/(<the pattern above>))…$
     *
     * which requires a first segment with no dot to stand in for the locale, and applies the
     * pattern's own negative lookahead only to what comes after it. Two consequences the comment on
     * `config.matcher` in proxy.ts does not describe:
     *
     *  - A single-segment path never matches, whether or not it has a dot: `/`, `/es`, `/llms.txt`,
     *    `/robots.txt`, `/sitemap.xml`, `/feed.xml` all come back false.
     *  - `/api/analytics` matches, because `api` is consumed as the locale segment before the
     *    `(?!api/)` lookahead is ever applied. `/es/api/analytics` does not.
     *
     * **This is not a Next 16 or a proxy regression.** The compiled regexp is byte-identical to the
     * one Next 15 produced for `middleware.ts`, verified by diffing this build's
     * `functions-config-manifest.json` against the previous build's `middleware-manifest.json`.
     *
     * And `next start` does not agree with it: serving this build and requesting `/llms.txt` with a
     * GPTBot user agent DOES run the proxy (the once-per-instance `[ai-crawler]` warning appears),
     * while `/favicon.ico` does not. So the compiled regexp and the local server disagree about
     * single-segment paths, and which of the two the production platform follows is the open
     * question — which is why the preview checks in 3.6 and 3.7 have to cover `/llms.txt`, not only
     * a locale-prefixed page.
     */
    it('reports single-segment paths as not matching, including the files crawlers read', async () => {
        await expect(doesMatch('https://xabierlameiro.com/')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/es')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/llms.txt')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/robots.txt')).resolves.toBe(false);
        await expect(doesMatch('https://xabierlameiro.com/sitemap.xml')).resolves.toBe(false);
    });

    it('reports /api as matching, which the matcher comment says it excludes', async () => {
        await expect(doesMatch('https://xabierlameiro.com/api/analytics')).resolves.toBe(true);
        await expect(doesMatch('https://xabierlameiro.com/es/api/analytics')).resolves.toBe(false);
    });
});

/**
 * @description `nextUrl.locale` is what `requestedPath` in proxy.ts rebuilds the crawler-visible
 * path from, and design.md §D5 left open whether the Node runtime still populates it. This test
 * records the answer for the unit level, which is: it cannot be answered here.
 */
describe('nextUrl.locale on a bare NextRequest', () => {
    it('is empty, so the locale-prefixed path can only be verified against a running server', async () => {
        const { NextRequest } = await import('next/server');

        // A NextRequest constructed by hand has no i18n config attached — `locale` is '' and
        // `defaultLocale` is undefined for a path that plainly carries `/es`. Next fills both in
        // only when it builds the request itself, from the config it loaded at boot. So the
        // `/es` + path reconstruction in `requestedPath` is unobservable from a unit test, and the
        // preview check in 3.7 is not a belt-and-braces extra: it is the only place it is tested.
        const request = new NextRequest('https://xabierlameiro.com/es/blog/error/resolver-direccion-en-uso-error');

        expect(request.nextUrl.locale).toBe('');
        expect(request.nextUrl.defaultLocale).toBeUndefined();
        expect(request.nextUrl.pathname).toBe('/es/blog/error/resolver-direccion-en-uso-error');
    });
});
