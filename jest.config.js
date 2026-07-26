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
    // SDD-L01. Coverage was collected and published for a long time without any threshold, so
    // nothing stopped it sliding. These numbers are the floor MEASURED on 2026-07-26 after the
    // collectCoverageFrom globs below were corrected (84.39 stmts / 67.63 branches / 81.44 funcs),
    // rounded down by about a point of tolerance. They are a ratchet, not a target: raise them when
    // coverage genuinely improves, and never lower them to make a red build green.
    //
    // Global-only on purpose. Jest also accepts per-directory keys, but its documented interaction
    // with `global` is ambiguous about whether matched files are excluded from the global aggregate
    // — and a threshold whose semantics are unclear is worse than one fewer threshold. Per-path
    // floors for src/helpers/ (63% stmts) and src/hooks/ (77%) belong in SDD-L10, once the
    // behaviour is pinned down empirically.
    coverageThreshold: {
        global: {
            statements: 83,
            branches: 66,
            functions: 80,
            lines: 83,
        },
    },
    testEnvironment: 'jest-environment-jsdom',
    // html powers the published report; lcovonly feeds Sonar and json feeds fallow health --coverage
    coverageReporters: ['html', 'lcovonly', 'json'],
    // helpers and API routes hold unit-testable logic and belong in the coverage picture;
    // leaving them out reported 84% while a third of the codebase was simply unmeasured.
    // src/pages/**/*.tsx stays out on purpose: those are integration-level, covered by e2e.
    // Match both extensions per directory. Single-extension globs silently dropped three tested
    // modules from the denominator — src/components/SEO/jsonLd.ts, src/constants/survey.tsx (the XSS
    // sanitiser) and src/helpers/mdxjs.tsx — which is the same blind spot the note above describes.
    collectCoverageFrom: [
        'src/components/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/helpers/**/*.{ts,tsx}',
        'src/pages/api/**/*.ts',
        'src/constants/**/*.{ts,tsx}',
        'src/context/**/*.{ts,tsx}',
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
