// Mock environment variables
process.env.NEXT_PUBLIC_DOMAIN = 'https://xabierlameiro.com';

jest.mock('react-intl', () => ({
    useIntl: () => ({
        formatMessage: (object) => object.id,
        formatDate: (date) => date,
        formatNumber: (number) => number,
    }),
}));

jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '/',
            query: '',
            asPath: '',
            push: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
            },
            beforePopState: jest.fn(() => null),
            prefetch: jest.fn(() => null),
        };
    },
}));

jest.mock(
    'next/head',
    () =>
        function Head(props) {
            return <>{props.children}</>;
        }
);

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
