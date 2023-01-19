/**
 * This is a wrapper for the console object.
 * It will only log to the console if the NODE_ENV is set to development.
 *
 */
const console = {
    log: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.error(...args);
        }
    },
    warn: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(...args);
        }
    },
    info: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.info(...args);
        }
    },
};

export default console;
