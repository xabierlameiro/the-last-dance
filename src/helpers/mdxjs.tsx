import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
import Loading from '@/components/RenderManager/Loading';

// @ts-ignore
import { CH } from '@xabierlameiro/code-hike/dist/components.cjs.js';
import dynamic from 'next/dynamic';

const GoogleAdsense = dynamic(() => import('@/components/GoogleAdsense'), {
    loading: () => <Loading />,
    ssr: false,
});

const Date = dynamic(() => import('@/components/Date'));

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    const closeHandler = () => dispatch({ type: 'close' });
    return <CButtons disabled withPadding onClickClose={closeHandler} onClickMinimise={closeHandler} />;
};

export const components = { CH, ControlButtons, Date, GoogleAdsense };
