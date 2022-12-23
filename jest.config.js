// jest.config.js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    coveragePathIgnorePatterns: ['^.*\\.stories\\.[jt]sx?$'],
    coverageDirectory: 'public/coverage',
    testEnvironment: 'jest-environment-jsdom',
    coverageReporters: ['html'],
    collectCoverageFrom: ['src/components/**/*.tsx'],
    moduleNameMapper: {
        '^@/helpers(.*)$': '<rootDir>src/helpers/index.ts$1',
        '^@/layout(.*)$': '<rootDir>src/components/Layout/index.tsx$1',
        '^@/test$': '<rootDir>/jest.setup.js',
        '^@/components(.*)$': '<rootDir>src/components/$1',
        '^@/context(.*)$': '<rootDir>src/context/$1',
        '^@/hooks(.*)$': '<rootDir>src/hooks/$1',
        '^@/constants(.*)$': '<rootDir>src/constants/$1',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
