import React from 'react';

/**
 * @description Which of the blog's two side panels is open, and how to change that.
 *
 * SDD-L05: the two `onSideShift*` handlers read `e.touches[0]`, so opening a panel was a touch-only
 * gesture on the panel itself — undiscoverable, and impossible with a keyboard or a mouse. Combined
 * with the CSS collapsing those panels to 10px rails up to 900px while hiding the grabber from 768px,
 * that left a 768–900px band where the categories and post-list navigation could not be reached at all.
 *
 * `toggleLeft`/`toggleRight` are the same state transitions without an event, so a real button can
 * drive them. The touch handlers stay as an enhancement rather than the only path.
 */
const useSideShift = (): {
    left: boolean;
    right: boolean;
    onSideShiftLeft: (e: React.TouchEvent<HTMLDivElement>) => void;
    onSideShiftRight: (e: React.TouchEvent<HTMLDivElement>) => void;
    toggleLeft: () => void;
    toggleRight: () => void;
} => {
    const [left, setLeft] = React.useState(false);
    const [right, setRight] = React.useState(false);

    const onSideShiftLeft = (e: React.TouchEvent<HTMLDivElement>) => {
        // A touchstart always carries at least one touch in practice, but destructuring an empty
        // TouchList throws — so bail rather than assume.
        const touch = e.touches[0];
        if (!touch) return;
        const { clientWidth } = e.currentTarget;
        setLeft(touch.clientX < clientWidth / 2);
    };

    const onSideShiftRight = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        if (!touch) return;
        const { clientWidth } = e.currentTarget;
        setRight(touch.clientX <= clientWidth / 2);
    };

    /**
     * Mutually exclusive, because `resolveSideClass` in the post page can only express ONE open panel
     * (`openPosts` OR `openCategories`) — the grid has a single 200px slot to give away. The touch
     * handlers are exclusive by construction, since they derive from where the finger landed; naive
     * independent toggles were not, and setting both true produced a state the CSS cannot render, so
     * the button appeared to do nothing while `aria-expanded` said otherwise.
     */
    const toggleLeft = React.useCallback(() => {
        setLeft((open) => !open);
        setRight(false);
    }, []);

    const toggleRight = React.useCallback(() => {
        setRight((open) => !open);
        setLeft(false);
    }, []);

    return { left, onSideShiftLeft, right, onSideShiftRight, toggleLeft, toggleRight };
};

export default useSideShift;
