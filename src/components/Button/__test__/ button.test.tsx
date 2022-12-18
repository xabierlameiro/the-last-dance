import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../';

describe('Button component', () => {
    it('Should render the button', () => {
        render(<Button />);
        expect(screen.getByTestId('button')).toBeInTheDocument();
    });
});
