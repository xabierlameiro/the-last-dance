import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { CAPTURE_TARGETS, LOCALES, NON_RENDERING_ROUTES } from './targets';

/**
 * @description Coverage is derived, not transcribed.
 *
 * A hand-written target list cannot detect its own omissions: add a page and the suite stays green
 * while the new screen has no baseline. These checks compare the list against the page tree and
 * against `next.config.ts`, and fail in either direction — a target for a page that no longer
 * exists is as wrong as a page with no target.
 */

// Playwright loads these specs as ES modules, where `__dirname` does not exist.
const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const PAGES_DIR = path.join(REPO_ROOT, 'src', 'pages');
const NEXT_CONFIG = path.join(REPO_ROOT, 'next.config.ts');

/** Route files under `src/pages`, relative and extensionless — `api`, `_app`, `_document` aside. */
function routeFiles(dir: string, prefix = ''): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            return entry.name === 'api' ? [] : routeFiles(path.join(dir, entry.name), relative);
        }

        if (!/\.tsx$/.test(entry.name)) return [];

        const route = relative.replace(/\.tsx$/, '');

        return route === '_app' || route === '_document' ? [] : [route];
    });
}

test.describe('visual coverage', () => {
    test('every route file is either captured or declared non-rendering', () => {
        const onDisk = new Set(routeFiles(PAGES_DIR));
        const accounted = new Set<string>([
            ...CAPTURE_TARGETS.map((target) => target.route),
            ...NON_RENDERING_ROUTES,
        ]);

        const missing = [...onDisk].filter((route) => !accounted.has(route)).sort();
        const stale = [...accounted].filter((route) => !onDisk.has(route)).sort();

        expect(
            missing,
            'Route files with no capture target. A screen with no baseline is a screen no change ' +
                'can be measured against — add it to CAPTURE_TARGETS, or to NON_RENDERING_ROUTES ' +
                'if it renders nothing.'
        ).toEqual([]);

        expect(
            stale,
            'Targets naming route files that no longer exist. Left alone these fail as a 404 ' +
                'mid-capture, which reads as a rendering bug rather than a stale list.'
        ).toEqual([]);
    });

    test('the locale list matches next.config.ts', () => {
        const config = fs.readFileSync(NEXT_CONFIG, 'utf8');
        const declared = config.match(/locales:\s*\[([^\]]*)\]/)?.[1];

        expect(declared, 'No `locales` array found in next.config.ts').toBeDefined();

        const configured = [...(declared ?? '').matchAll(/['"]([a-z-]+)['"]/g)]
            .map((match) => match[1])
            .filter((locale): locale is string => locale !== undefined)
            .sort();

        expect(
            configured,
            'A locale was added or removed in next.config.ts without updating LOCALES, so the ' +
                'suite would capture a set of languages the site no longer serves.'
        ).toEqual([...LOCALES].sort());
    });
});
