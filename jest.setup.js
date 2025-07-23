import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import '@testing-library/jest-dom';
import React from 'react';

fetchMock.enableMocks();

// Mock Next.js Head to render children in the DOM for testing
jest.mock('next/head', () => {
    return function Head({ children }) {
        return React.createElement('div', { 'data-testid': 'next-head' }, children);
    };
});

const AllTheProviders = ({ children }) => {
    return React.createElement(React.Fragment, null, children);
};
const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
