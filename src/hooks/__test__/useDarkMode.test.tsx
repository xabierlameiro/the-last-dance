import { render, screen, fireEvent } from '@/test';
import useDarkMode from '../useDarkMode';

const TestComponent = () => {
    const { theme, toggleTheme } = useDarkMode();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <button onClick={toggleTheme}>toggle</button>
        </div>
    );
};

describe('useDarkMode hook', () => {
    it('toggles theme values', () => {
        render(<TestComponent />);
        expect(screen.getByTestId('theme').textContent).toBe('');
        fireEvent.click(screen.getByText('toggle'));
        expect(screen.getByTestId('theme').textContent).toBe('dark');
        fireEvent.click(screen.getByText('toggle'));
        expect(screen.getByTestId('theme').textContent).toBe('light');
    });
});
