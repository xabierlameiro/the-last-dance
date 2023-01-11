import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const AllTheProviders = ({ children }) => {
    return <>{children}</>;
};
const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
