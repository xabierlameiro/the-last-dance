import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
// @ts-ignore
import { CH } from '@xabierlameiro/code-hike/dist/components.cjs.js';
import Date from '@/components/Date';
import GoogleAdsense from '@/components/GoogleAdsense';

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    const closeHandler = () => dispatch({ type: 'close' });
    return <CButtons disabled withPadding onClickClose={closeHandler} onClickMinimise={closeHandler} />;
};

export const components = { CH, ControlButtons, Date, GoogleAdsense };
