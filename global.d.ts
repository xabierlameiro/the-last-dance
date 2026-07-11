declare module 'glob' {
    export function sync(pattern: string): string[];
}

declare module 'prettier' {
    export function format(content: string, options?: object): string;
}

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
