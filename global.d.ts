declare module 'glob' {
    export function sync(pattern: string): string[];
}

declare module 'prettier' {
    export function format(content: string, options?: Object): string;
}
