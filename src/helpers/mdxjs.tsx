import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
// @ts-ignore
import { CH } from '@xabierlameiro/code-hike/dist/components.cjs.js';
import dynamic from 'next/dynamic';
import Adsense from '@/components/GoogleAdsense';
import VisibilityManager from '@/components/VisibilityManager';

const GoogleAdsense = () => {
    return (
        <VisibilityManager hideOnDesktop hideOnTablet>
            <Adsense slot="6172794554" />
        </VisibilityManager>
    );
};

const Date = dynamic(() => import('@/components/Date'));

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    const closeHandler = () => dispatch({ type: 'close' });
    return <CButtons disabled withPadding onClickClose={closeHandler} onClickMinimise={closeHandler} />;
};

export const components = { CH, ControlButtons, Date, GoogleAdsense };
