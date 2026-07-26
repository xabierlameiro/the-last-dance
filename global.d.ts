/*
 * SDD-L10-T10. Two hand-rolled `declare module` blocks used to sit here, for `glob` and `prettier`.
 * Both shadowed the packages' real, shipped types with a guess.
 *
 * The prettier one was a live trap rather than merely redundant. It declared
 * `format(): string`; in Prettier 3 it returns `Promise<string>`. With the declaration in place an
 * upgrade would have typechecked cleanly while `fileWritter.ts` wrote the literal string
 * `[object Promise]` into `public/sitemap.xml` — and that surfaces three layers away as a wrong
 * count in the indexed-pages widget, not as an error anywhere near the cause.
 *
 * Both packages ship their own types. Deleting these is what let the compiler point at the exact
 * line needing an `await` when prettier went to 3.
 */

// Jest globals
declare global {
    var jest: typeof import('@jest/globals').jest;
    var describe: typeof import('@jest/globals').describe;
    var it: typeof import('@jest/globals').it;
    var test: typeof import('@jest/globals').test;
    var expect: typeof import('@jest/globals').expect;
    var beforeAll: typeof import('@jest/globals').beforeAll;
    var beforeEach: typeof import('@jest/globals').beforeEach;
    var afterAll: typeof import('@jest/globals').afterAll;
    var afterEach: typeof import('@jest/globals').afterEach;
}
