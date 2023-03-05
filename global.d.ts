declare module 'glob' {
    export function sync(pattern: string): string[];
}

declare module 'prettier' {
    export function format(content: string, options?: Object): string;
}

declare module 'nodemailer' {
    export function createTransport(options?: Object): {
        sendMail(options: Object): Promise<any>;
    };
}
