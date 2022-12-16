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
    collectCoverage: true,
    coverageReporters: ['json', 'html'],
    testEnvironment: 'jsdom',
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
    moduleDirectories: ['node_modules', '<rootDir>/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mdx'],
    moduleNameMapper: {
        '^@/layout(.*)$': '<rootDir>src/components/layout/index.tsx$1',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
