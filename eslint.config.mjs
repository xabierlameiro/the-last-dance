import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';

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
            // Playwright's generated HTML report and traces. Gitignoring them is not enough: flat
            // config does not read .gitignore, so `eslint .` linted the bundled report JS and
            // produced ~9,000 errors as soon as the suite had been run locally.
            'playwright-report/**',
            'test-results/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    sonarjs.configs.recommended,
    /**
     * SDD-L05. Absent from package.json, the lockfile and node_modules before this — which is why
     * the audit's accessibility findings existed at all: roughly two thirds of them map to rules in
     * this set (click-events-have-key-events, no-static-element-interactions, alt-text,
     * label-has-associated-control, anchor-is-valid).
     *
     * `flatConfigs.recommended` defaults every rule to `error`, and it is left there: this change
     * fixes everything it reported, so it starts clean and any regression fails the PR gate.
     *
     * Honest correction to the plan: it predicted this would catch "roughly two thirds" of the
     * audit's Critical and High accessibility findings. It reported **13 problems across 4 rules**.
     * The rest of that dimension — contrast ratios, missing ARIA, duplicate landmarks, heading
     * order, focus management — is not statically detectable and had to be found and fixed by hand.
     * Useful, and nowhere near sufficient.
     */
    jsxA11y.flatConfigs.recommended,
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
        // Node ESM scripts (trending radar, poster generation, etc.)
        // SDD-L11: `.ts` is listed alongside `.mjs` because these files are migrating to
        // TypeScript one at a time. The carve-outs below are keyed to what the code is — Node
        // tooling over trusted local input — not to the extension it currently carries, and a
        // rename must not silently change which rules apply to the same script.
        files: ['scripts/**/*.{js,mjs,ts}'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // Utility scripts favour terse expressions; a nested ternary is fine here.
            'sonarjs/no-nested-conditional': 'off',
        },
    },
    {
        // The custom-* report post-processors (SDD-L11-T5). ESM TypeScript, unlike the CommonJS
        // block above. They rewrite HTML that istanbul, jsdoc and Playwright generate locally, so
        // the regexes never see remote input and the ReDoS rule does not apply — the same
        // exemption the `custom-*.js` block granted them before the rename.
        files: ['custom-*.ts'],
        rules: {
            'sonarjs/slow-regex': 'off',
        },
    }
);
