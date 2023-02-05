import AsidePanel from '..';
import { render, screen } from '@/test';

describe('AsidePanel', () => {
    it('should render the aside panel', () => {
        render(<AsidePanel />);
        expect(screen.getByTestId('aside-panel')).toBeInTheDocument();
        expect(screen.getByTestId('aside-panel').children.length).toBe(3);
    });
});
