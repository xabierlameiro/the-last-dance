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

    React.useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                isMobile: window.innerWidth <= mobileMax,
                isTablet: window.innerWidth <= tabletMax && window.innerWidth >= tabletMin,
                isDesktop: window.innerWidth >= desktopMin,
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
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
