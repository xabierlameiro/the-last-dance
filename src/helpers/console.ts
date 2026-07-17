/**
 * This is a wrapper for the console object.
 * It will only log to the console if the NODE_ENV is set to development.
 *
 */
const devConsole = {
    log: (...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            globalThis.console.log(...args);
        }
    },
    error: (...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            globalThis.console.error(...args);
        }
    },
    warn: (...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            globalThis.console.warn(...args);
        }
    },
    info: (...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            globalThis.console.info(...args);
        }
    },
};

export default devConsole;
