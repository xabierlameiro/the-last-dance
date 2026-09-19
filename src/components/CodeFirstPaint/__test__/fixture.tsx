import type React from 'react';
import type CodeFirstPaint from '..';

const line = (...tokens: [string, string][]) => ({
    tokens: tokens.map(([content, color]) => ({ content, props: { style: { color } } })),
});

// The shape the compiled MDX passes to `CH.Code`, cut down to two files.
export const codeProps = {
    lineNumbers: true,
    codeConfig: { theme: { colors: { 'editor.background': '#282c34', 'editor.foreground': '#abb2bf' } } },
    northPanel: { tabs: ['index.tsx', 'contact.json'], active: 'contact.json', heightRatio: 1 },
    files: [
        { name: 'index.tsx', focus: '', code: { lang: 'tsx', lines: [line(['import ', '#C678DD'])] } },
        { name: 'contact.json', focus: '', code: { lang: 'json', lines: [line(['{', '#ABB2BF']), line(['"email"', '#E06C75'])] } },
    ],
} as unknown as React.ComponentProps<typeof CodeFirstPaint>;
