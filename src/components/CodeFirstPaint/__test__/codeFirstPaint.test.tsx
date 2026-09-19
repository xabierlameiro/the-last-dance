import { render, screen } from '@/test';
import CodeFirstPaint from '..';
import { codeProps } from './fixture';

jest.mock('@code-hike/mdx/dist/components.cjs.js', () => ({
    Code: () => <div data-testid="code-hike" />,
}));

describe('CodeFirstPaint in the browser', () => {
    it('hands over to Code Hike once mounted', () => {
        render(<CodeFirstPaint {...codeProps} />);

        expect(screen.getByTestId('code-hike')).toBeInTheDocument();
        expect(screen.queryByTestId('code-first-paint')).not.toBeInTheDocument();
    });
});
