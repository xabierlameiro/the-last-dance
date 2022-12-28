import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const AllTheProviders = ({ children }) => {
    return <>{children}</>;
};
const customRender = (ui, options) =>
    render(ui, { wrapper: AllTheProviders, ...options });

// hide error messages about act() being unsupported in production build
const ignoredErrors = [
    /act(...) is not supported in production builds of React./,
];
const consoleError = global.console.error;
global.console.error = (...args) => {
    if (ignoredErrors.some((el) => el.test(args[0]))) {
        return consoleError(...args);
    }
};

export * from '@testing-library/react';
export { customRender as render };
