// jest.config.js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
    reporters: ['default', ['<rootDir>/custom-reporter.js', {}]],
    coverageDirectory: 'public/coverage',
    testEnvironment: 'jest-environment-jsdom',
    coverageReporters: ['html'],
    moduleNameMapper: {
        '^@/layout(.*)$': '<rootDir>src/components/layout/index.tsx$1',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
