import { renderHook, act } from '@testing-library/react';
import usePrefersReducedMotion from '../usePrefersReducedMotion';

/**
 * SDD-L06. The global `prefers-reduced-motion` CSS block cannot stop motion that JavaScript paints —
 * the survey's confetti is a canvas on a timer — so this hook gates it. These tests pin the two
 * things that matter: it reports the preference, and it keeps reporting it when the user changes it
 * mid-session.
 */
describe('usePrefersReducedMotion', () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();

    const mockMatchMedia = (matches: boolean) => {
        listeners.clear();
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: jest.fn().mockImplementation((query: string) => ({
                matches,
                media: query,
                addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
                removeEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => listeners.delete(cb),
            })),
        });
    };

    it('reports false when the preference is not set', () => {
        mockMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(false);
    });

    it('reports true when the preference is set', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(true);
    });

    it('follows the preference when it changes mid-session', () => {
        mockMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(false);

        act(() => {
            listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
        });

        expect(result.current).toBe(true);
    });

    it('detaches its listener on unmount', () => {
        mockMatchMedia(false);
        const { unmount } = renderHook(() => usePrefersReducedMotion());
        expect(listeners.size).toBe(1);

        unmount();

        expect(listeners.size).toBe(0);
    });
});
