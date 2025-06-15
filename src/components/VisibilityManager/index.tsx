import type { ReactElement } from 'react';
import useWindowResize from '@/hooks/useWindowResize';

type Props = {
    children: ReactElement | ReactElement[];
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
};

/**
 * @example
 *     <VisibilityManager hideOnDesktop={true}>
 *
 * @param {boolean} hideOnDesktop - If true, the component will be hidden on desktop
 * @param {boolean} hideOnTablet - If true, the component will be hidden on tablet
 * @param {boolean} hideOnMobile - If true, the component will be hidden on mobile
 * @returns {ReactElement | null}
 */
const VisibilityManager = (props: Props): ReactElement | null => {
    const { children, hideOnDesktop, hideOnTablet, hideOnMobile } = props;
    const { isMobile, isDesktop, isTablet } = useWindowResize();

    const hideBecauseOfWidth = (hideOnDesktop && isDesktop) || (hideOnTablet && isTablet) || (hideOnMobile && isMobile);

    if (hideBecauseOfWidth) {
        return null;
    }

    return <>{children}</>;
};

export default VisibilityManager;
