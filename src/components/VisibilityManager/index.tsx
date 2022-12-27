import type { ReactElement } from 'react';
import useWindowResize from '@/hooks/useWidowResize';

type Props = {
    children: ReactElement | ReactElement[];
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
};

const VisibilityManager = (props: Props): ReactElement | null => {
    const { children, hideOnDesktop, hideOnTablet, hideOnMobile } = props;
    const { isMobile, isDesktop, isTablet } = useWindowResize();

    const hideBecauseOfWidth =
        (hideOnDesktop && isDesktop) ||
        (hideOnTablet && isTablet) ||
        (hideOnMobile && isMobile);

    if (hideBecauseOfWidth) {
        return null;
    }

    return <>{children}</>;
};

export default VisibilityManager;
