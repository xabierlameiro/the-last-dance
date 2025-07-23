/**
 * Setup environment variables for testing
 */

// Mock environment variables for testing
process.env.NEXT_PUBLIC_DOMAIN = 'https://pre.xabierlameiro.com';
process.env.NEXT_PUBLIC_GA = 'G-TEST123';
process.env.NEXT_PUBLIC_ENV = 'test';

// Suppress console.warn for cleaner test output
global.console.warn = jest.fn();
