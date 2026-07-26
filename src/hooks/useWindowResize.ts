import React from 'react';
import { mobileMax, tabletMax, tabletMin, desktopMin } from '@/constants/devices';

type WindowTpe = {
    isMobile: boolean;
    isTablet: boolean;
    isMobileOrTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
};

function useWindowResize(): WindowTpe {
    const [widowSize, setWindowSize] = React.useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        width: 0,
        height: 0,
    });

    /**
     * SDD-L09-T11. `handleResize` used to read `window.innerWidth` four times and `innerHeight`
     * once, then call `setWindowSize` with a **new object** — on every single resize event. A drag
     * of a desktop window fires those by the hundred, and each one produced a state object that was
     * never equal to the last by identity, so every one re-rendered the whole subtree. On the survey
     * page that subtree includes a full-viewport `<Confetti>` canvas.
     *
     * Two changes. The measurement is now coalesced into one animation frame, which is the rate at
     * which a change could be painted anyway; and the result is compared field by field, so the
     * common case — a resize that does not cross a breakpoint and does not change the numbers React
     * renders — bails out without touching state at all.
     */
    React.useEffect(() => {
        let frame = 0;

        const measure = () => {
            frame = 0;
            const next = {
                isMobile: window.innerWidth <= mobileMax,
                isTablet: window.innerWidth <= tabletMax && window.innerWidth >= tabletMin,
                isDesktop: window.innerWidth >= desktopMin,
                width: window.innerWidth,
                height: window.innerHeight,
            };

            setWindowSize((current) =>
                current.width === next.width &&
                current.height === next.height &&
                current.isMobile === next.isMobile &&
                current.isTablet === next.isTablet &&
                current.isDesktop === next.isDesktop
                    ? current
                    : next
            );
        };

        const handleResize = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(measure);
        };

        window.addEventListener('resize', handleResize);

        measure();

        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return {
        isMobile: widowSize.isMobile,
        isTablet: widowSize.isTablet,
        isMobileOrTablet: widowSize.isMobile || widowSize.isTablet,
        isDesktop: widowSize.isDesktop,
        width: widowSize.width,
        height: widowSize.height,
    };
}
export default useWindowResize;
