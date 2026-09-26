/**
 * Setup environment variables for testing
 */

// Mock environment variables for testing
process.env.NEXT_PUBLIC_DOMAIN = 'https://pre.xabierlameiro.com';
process.env.NEXT_PUBLIC_GA = 'G-TEST123';
process.env.NEXT_PUBLIC_ENV = 'test';

// Suppress console.warn for cleaner test output
global.console.warn = jest.fn();

// jsdom (the npm package, used by API routes) needs TextEncoder/TextDecoder,
// which the jest-environment-jsdom sandbox does not provide
const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || NodeTextEncoder;
global.TextDecoder = global.TextDecoder || NodeTextDecoder;

/*
 * Next 16 ships `server/node-environment-extensions/fast-set-immediate`, which replaces
 * `globalThis.setImmediate` with its own scheduler. On first load it stores the originals under
 * `Symbol.for('next.fast-set-immediate.originals')` — and jsdom does not define `setImmediate`, so
 * what it stores is `undefined`. Its patch then installs a function that calls
 * `originalSetImmediate.apply(...)`, and React's `enqueueTask` reaches for `setImmediate` because
 * one now exists. The result is `TypeError: Cannot read properties of undefined (reading 'apply')`.
 *
 * It surfaced as a flake, not a failure: two tests out of 479, in a different suite on every run
 * (ArticlePanel on one, Layout and Notification on the next) and green when the suite is run alone.
 * The suite that fails is whichever one Jest schedules into a worker where a Next import has
 * already triggered the patch, so the whole run passing proves nothing about the next one.
 *
 * Giving jsdom the real Node implementations before any Next module loads means Next captures those
 * as its originals and the patch works as designed. `setupFiles` is early enough: it runs before
 * the test file and its imports. This is an environment gap, not a product bug — nothing in the app
 * calls `setImmediate`.
 */
const nodeTimers = require('node:timers');
global.setImmediate = global.setImmediate || nodeTimers.setImmediate;
global.clearImmediate = global.clearImmediate || nodeTimers.clearImmediate;
