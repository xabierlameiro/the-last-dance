import { act, renderHook } from '@testing-library/react';
import useSideShift from '../useSideShift';

/**
 * SDD-L10-T14. The only fully untested hook in the project — 0/19 statements — and SDD-L05 had just
 * rewritten it, which is the worst possible combination.
 *
 * The invariant worth pinning is mutual exclusion. `resolveSideClass` on the post page can express
 * only ONE open panel, because the grid has a single 200px slot to give away. The touch handlers are
 * exclusive by construction (they derive from which half of the element the finger landed on), but
 * the keyboard toggles SDD-L05 added are not — and naive independent toggles produced `left && right`,
 * a state the CSS cannot render, so the button appeared to do nothing while `aria-expanded` claimed
 * it had worked.
 */
const touchEvent = (clientX: number, clientWidth = 1000) =>
    ({
        touches: [{ clientX }],
        currentTarget: { clientWidth },
    }) as unknown as React.TouchEvent<HTMLDivElement>;

describe('useSideShift', () => {
    it('should start with both panels closed', () => {
        const { result } = renderHook(() => useSideShift());

        expect(result.current.left).toBe(false);
        expect(result.current.right).toBe(false);
    });

    it('should open the left panel from a touch on the left half', () => {
        const { result } = renderHook(() => useSideShift());

        act(() => result.current.onSideShiftLeft(touchEvent(100)));

        expect(result.current.left).toBe(true);
    });

    it('should close the left panel from a touch on the right half', () => {
        const { result } = renderHook(() => useSideShift());

        act(() => result.current.onSideShiftLeft(touchEvent(100)));
        act(() => result.current.onSideShiftLeft(touchEvent(900)));

        expect(result.current.left).toBe(false);
    });

    it('should open the right panel from a touch on the left half', () => {
        const { result } = renderHook(() => useSideShift());

        act(() => result.current.onSideShiftRight(touchEvent(100)));

        expect(result.current.right).toBe(true);
    });

    /**
     * SDD-L07 enabled `noUncheckedIndexedAccess`, which surfaced this: `e.touches[0]` destructured
     * from a possibly-empty TouchList. A touchstart always carries a touch in practice, so this is a
     * guard rather than a fix for an observed crash — but "in practice" is not a type.
     */
    it('should ignore a touch event carrying no touches', () => {
        const { result } = renderHook(() => useSideShift());
        const empty = { touches: [], currentTarget: { clientWidth: 1000 } } as unknown as React.TouchEvent<HTMLDivElement>;

        act(() => result.current.onSideShiftLeft(empty));

        expect(result.current.left).toBe(false);
    });

    // The invariant. Opening either panel must close the other, because the layout has one slot.
    it('should keep the two panels mutually exclusive', () => {
        const { result } = renderHook(() => useSideShift());

        act(() => result.current.toggleLeft());
        expect(result.current.left).toBe(true);
        expect(result.current.right).toBe(false);

        act(() => result.current.toggleRight());
        expect(result.current.right).toBe(true);
        expect(result.current.left).toBe(false);

        act(() => result.current.toggleLeft());
        expect(result.current.left).toBe(true);
        expect(result.current.right).toBe(false);
    });

    it('should close an open panel when its own toggle fires again', () => {
        const { result } = renderHook(() => useSideShift());

        act(() => result.current.toggleLeft());
        act(() => result.current.toggleLeft());

        expect(result.current.left).toBe(false);
    });
});
