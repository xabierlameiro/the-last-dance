// jest.config.js
import nextJest from 'next/jest.js';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    setupFiles: ['<rootDir>/jest.mock.js'],
    coveragePathIgnorePatterns: [
        '^.*\\.stories\\.[jt]sx?$',
        'src/components/index.tsx',
        'src/components/Blog/index.tsx',
    ],
    coverageDirectory: 'public/coverage',
    testEnvironment: 'jest-environment-jsdom',
    coverageReporters: ['html'],
    collectCoverageFrom: ['src/components/**/*.tsx'],
    moduleNameMapper: {
        '^@/helpers(.*)$': '<rootDir>src/helpers/index.ts$1',
        '^@/helpers(.*)$': '<rootDir>src/helpers/$1',
        '^@/layout(.*)$': '<rootDir>src/components/Layout/index.tsx$1',
        '^@/test$': '<rootDir>/jest.setup.js',
        '^@/components(.*)$': '<rootDir>src/components/$1',
        '^@/ssrcomponents(.*)$': '<rootDir>app/components/$1',
        '^@/context(.*)$': '<rootDir>src/context/$1',
        '^@/hooks(.*)$': '<rootDir>src/hooks/$1',
        '^@/constants(.*)$': '<rootDir>src/constants/$1',
    },

    // Load environment variables from .env.test.local and .env.test
    // https://nextjs.org/docs/basic-features/environment-variables#test-environment-variables
    ...loadEnvConfig(process.cwd(), true).combinedEnv,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
