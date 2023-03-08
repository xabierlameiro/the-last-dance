import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
// @ts-ignore
import { CH } from '@xabierlameiro/code-hike/dist/components.cjs.js';
import dynamic from 'next/dynamic';
import VisibilityManager from '@/components/VisibilityManager';
import Loading from '@/components/RenderManager/Loading';
import Image from 'next/image';

const Adsense = dynamic(() => import('@/components/GoogleAdsense'), { ssr: false, loading: () => <Loading /> });

const GoogleAdsense = () => {
    return (
        <VisibilityManager hideOnDesktop hideOnTablet>
            <div
                style={{
                    display: 'grid',
                    margin: '0 auto',
                    minHeight: '321px',
                    overflow: 'hidden',
                }}
            >
                <Adsense slot="6172794554" />
            </div>
        </VisibilityManager>
    );
};

const Date = dynamic(() => import('@/components/Date'));

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    const closeHandler = () => dispatch({ type: 'close' });
    return <CButtons disabled withPadding onClickClose={closeHandler} onClickMinimise={closeHandler} />;
};

export const components = { CH, ControlButtons, Date, GoogleAdsense, Image };
