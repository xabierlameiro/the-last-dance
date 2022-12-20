import Dialog from '..';
import { render, screen } from '@/test';

describe('Dialog component', () => {
    it('Should renders header, body and footer', () => {
        render(<Dialog open />);

        expect(screen.getByTestId('modal-header')).toBeInTheDocument();
        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
        expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    });
});
