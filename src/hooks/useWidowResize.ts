import React from 'react';
import {
    mobileMax,
    tabletMax,
    tabletMin,
    desktopMin,
} from '@/constants/devices';

type WindowTpe = {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};

function useWindowResize(): WindowTpe {
    const [widowSize, setWindowSize] = React.useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
    });

    React.useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                isMobile: window.innerWidth <= mobileMax,
                isTablet:
                    window.innerWidth <= tabletMax &&
                    window.innerWidth >= tabletMin,
                isDesktop: window.innerWidth >= desktopMin,
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
        isDesktop: widowSize.isDesktop,
    };
}
export default useWindowResize;
