import CountDown from '..';
import { render, screen, act } from '@/test';

// The countdown reads Date.now() and updates on a 1s timer, so both are pinned here.
const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('CountDown', () => {
    it('should render correctly', () => {
        render(<CountDown date="2023-05-06T00:00:00+00:00" />);
        expect(document.querySelector('.countdown')).toBeInTheDocument();
    });

    describe('with a pinned clock', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(NOW);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should count down to a future date and zero-pad single digits', () => {
            // 2 days, 3 hours, 4 minutes and 5 seconds ahead of NOW
            render(<CountDown date="2026-01-03T03:04:05.000Z" />);

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            const text = screen.getByTestId('countdown').textContent ?? '';

            // Padded to two digits rather than rendered as bare 2 / 3 / 4
            expect(text).toContain('02');
            expect(text).toContain('03');
            expect(text).toContain('04');
        });

        it('should leave the counters at zero for a date already in the past', () => {
            render(<CountDown date="2020-01-01T00:00:00.000Z" />);

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            // difference <= 0 means setTime is never called, so the initial zeros stay
            const digits = Array.from(screen.getByTestId('countdown').querySelectorAll('div'))
                .map((node) => node.textContent)
                .filter((value) => value === '0');
            expect(digits.length).toBeGreaterThan(0);
        });
    });
});
