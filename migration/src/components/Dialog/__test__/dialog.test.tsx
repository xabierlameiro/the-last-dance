import Dialog from '..';
import { render, screen } from '@/test';

describe('Dialog component', () => {
    it('Should renders header, body and footer', () => {
        render(<Dialog open />);
        expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-body')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    });
    it('Should render with padding and modal mode', () => {
        render(<Dialog open withPadding modalMode />);
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog')).toHaveClass('padding');
        expect(screen.getByTestId('dialog')).toHaveClass('modalMode');
    });
    it('Should not visisble', () => {
        render(<Dialog />);
        expect(screen.getByTestId('dialog')).not.toHaveClass('open');
    });
});
