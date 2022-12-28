import { remarkCodeHike } from '@xabierlameiro/code-hike';
import theme from 'shiki/themes/one-dark-pro.json' assert { type: 'json' };
import { serialize as sz } from 'next-mdx-remote/serialize';
import path from 'path';
import fs from 'fs';

export const serializePath = (route: string, fileName: string) => {
    const PATH = path.join(process.cwd(), route);
    const DESKTOP_PATH = path.join(PATH, fileName);
    const mdx = fs.readFileSync(DESKTOP_PATH, 'utf8');

    return sz(mdx, {
        mdxOptions: {
            remarkPlugins: [[remarkCodeHike, { autoImport: false, theme }]],
            useDynamicImport: true,
        },
    });
};

export const serialize = (mdx: string) =>
    sz(mdx, {
        mdxOptions: {
            remarkPlugins: [[remarkCodeHike, { autoImport: false, theme }]],
            useDynamicImport: true,
        },
    });
