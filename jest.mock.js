/* global jest */

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

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));
