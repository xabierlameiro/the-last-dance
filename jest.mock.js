// Mock environment variables
process.env.NEXT_PUBLIC_DOMAIN = 'https://xabierlameiro.com';

jest.mock('react-intl', () => ({
    useIntl: () => ({
        formatMessage: (object) => object.id,
        formatDate: (date) => date,
        formatNumber: (number) => number,
    }),
    // SDD-L08: `ErrorBoundary` is a class component, so it cannot call `useIntl` and reads the same
    // context through `FormattedMessage` instead. Returning the id matches what `formatMessage`
    // does above, so assertions read the same way whichever API a component uses.
    FormattedMessage: ({ id }) => id,
}));

/*
 * SDD-L10-T17. Two defects in this mock.
 *
 * `query` was the empty **string** `''`, not an object. Next always provides an object, so any
 * component reading `query.name` got `undefined` from a string rather than from a missing key — the
 * same value by luck, and a different one the moment anything iterated it.
 *
 * And there was no `locale`, `locales` or `defaultLocale` at all. On a site that ships in three
 * languages, every unit test ran as if the router had no locale: `useSurvey` fell through to its
 * default, `useAnalytics` built an English slug, and nothing in the suite could observe a locale
 * bug. Combined with the intl mock returning message ids, the unit suite was structurally blind to
 * i18n — which is why SDD-L10-T6 covers locale switching in e2e instead.
 */
const defaultRouter = () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    locale: 'en',
    locales: ['en', 'es', 'gl'],
    defaultLocale: 'en',
    push: jest.fn(),
    events: {
        on: jest.fn(),
        off: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    prefetch: jest.fn(() => null),
});

// `jest.fn` rather than a plain method: as a bare function no test could override it, so no test
// could vary the locale or the path — the mock decided the answer for the whole suite. jest.setup.js
// restores this default before each test so an override cannot leak into the next one.
jest.mock('next/router', () => ({
    useRouter: jest.fn(defaultRouter),
    __defaultRouter: defaultRouter,
}));

/*
 * SDD-L10-T17: `next/head` was mocked here AND in jest.setup.js, with different implementations —
 * this one a bare fragment, that one a <div data-testid="next-head">. `setupFiles` runs before
 * `setupFilesAfterEnv`, so the second silently won and this one never applied. The SEO suite asserts
 * against `next-head`, so the surviving mock is the one in jest.setup.js; this copy is gone rather
 * than reconciled, because two mocks of one module is how a suite ends up testing the mock.
 */

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })
);

// jsdom does not implement AbortSignal.timeout, which Node 22 has and which src/helpers/http.ts uses
// to bound every outbound API-route fetch. Without this the routes throw under test while working in
// production — a gap in the test environment, not in the code, so it is polyfilled here rather than
// guarded at the call site.
if (typeof AbortSignal.timeout !== 'function') {
    AbortSignal.timeout = (ms) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(new DOMException('TimeoutError', 'TimeoutError')), ms).unref?.();
        return controller.signal;
    };
}

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));
