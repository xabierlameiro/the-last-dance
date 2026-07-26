import React from 'react';

/**
 * @description Whether the visitor has asked their OS to reduce motion.
 *
 * SDD-L06. The global `@media (prefers-reduced-motion: reduce)` block in globals.css covers CSS
 * animations and transitions, but it cannot reach motion that JavaScript paints — the survey's
 * confetti is a canvas driven by a timer, so the only way to stop it is not to render it.
 *
 * Starts `false` and resolves after mount, deliberately: reading `matchMedia` during render would
 * make the server and client markup disagree. Erring toward "motion allowed" for one frame is the
 * safe direction — the alternative would flash content off for everyone.
 *
 * @returns {boolean} True when the reduce-motion preference is set.
 */
const usePrefersReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(query.matches);

        const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    return prefersReducedMotion;
};

export default usePrefersReducedMotion;
