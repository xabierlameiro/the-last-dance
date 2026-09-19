// The Node build: jsdom resolves `react-dom/server` to the browser one, which needs MessageChannel.
import { renderToString } from 'react-dom/server.node';
import CodeFirstPaint from '..';
import { codeProps } from './fixture';

jest.mock('@code-hike/mdx/dist/components.cjs.js', () => ({
    Code: () => <div data-testid="code-hike" />,
}));

describe('CodeFirstPaint on the server', () => {
    it('paints the active file, highlighted and numbered, next to Code Hike', () => {
        const html = renderToString(<CodeFirstPaint {...codeProps} />);

        expect(html).toContain('data-testid="code-hike"');
        expect(html).toContain('data-testid="code-first-paint"');
        expect(html).toContain('aria-hidden="true"');
        expect(html).toContain('<span style="color:#E06C75">&quot;email&quot;</span>');
        expect(html).toContain('>2</span>');
        expect(html).not.toContain('import ');
    });
});
