import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'public/**',
            'storybook-static/**',
            'coverage/**',
            'lighthouse/assets/**',
            'data/**',
            'next-env.d.ts',
            '**/*.stories.tsx',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    sonarjs.configs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
        },
    },
    {
        // Node tooling / config scripts (CommonJS, trusted local input)
        files: ['*.js', '*.cjs', 'custom-*.js', 'jest.*.js', 'lighthouse/**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest,
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'sonarjs/slow-regex': 'off',
            'sonarjs/no-commented-code': 'off',
        },
    },
    {
        // Test files run under jest with looser expectations
        files: ['**/*.test.{ts,tsx}', '**/__test__/**', '**/__tests__/**', 'jest.setup.js'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'sonarjs/no-duplicate-string': 'off',
            'sonarjs/no-commented-code': 'off',
            'sonarjs/todo-tag': 'off',
        },
    },
    {
        // Node ESM scripts (trending radar etc.)
        files: ['scripts/**/*.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    }
);
