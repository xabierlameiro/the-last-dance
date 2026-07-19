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
    setupFiles: ['<rootDir>/jest.mock.js', '<rootDir>/jest.env.setup.js'],
    coveragePathIgnorePatterns: [
        '^.*\\.stories\\.[jt]sx?$',
        'src/components/index.tsx',
        'src/components/Blog/index.tsx',
        'migration/',
    ],
    testPathIgnorePatterns: ['e2e', 'migration'],
    coverageDirectory: 'public/coverage',
    testEnvironment: 'jest-environment-jsdom',
    // html powers the published report; lcovonly feeds Sonar and json feeds fallow health --coverage
    coverageReporters: ['html', 'lcovonly', 'json'],
    // helpers and API routes hold unit-testable logic and belong in the coverage picture;
    // leaving them out reported 84% while a third of the codebase was simply unmeasured.
    // src/pages/**/*.tsx stays out on purpose: those are integration-level, covered by e2e.
    collectCoverageFrom: [
        'src/components/**/*.tsx',
        'src/hooks/**/*.ts',
        'src/helpers/**/*.ts',
        'src/pages/api/**/*.ts',
        'src/constants/**/*.ts',
        'src/context/**/*.tsx',
        'scripts/trending/lib.js',
    ],
    moduleNameMapper: {
        '^@/helpers(.*)$': '<rootDir>src/helpers/$1',
        '^@/layout(.*)$': '<rootDir>src/components/Layout/index.tsx$1',
        '^@/test$': '<rootDir>/jest.setup.js',
        '^@/components(.*)$': '<rootDir>src/components/$1',
        '^@/ssrcomponents(.*)$': '<rootDir>app/components/$1',
        '^@/context(.*)$': '<rootDir>src/context/$1',
        '^@/hooks(.*)$': '<rootDir>src/hooks/$1',
        '^@/constants(.*)$': '<rootDir>src/constants/$1',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
