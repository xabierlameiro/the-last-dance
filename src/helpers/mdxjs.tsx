import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
// @ts-ignore
import { CH } from '@code-hike/mdx/dist/components.cjs.js';
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
                    minHeight: 'auto',
                    overflow: 'hidden',
                }}
            >
                <Adsense slot="6172794554" />
            </div>
        </VisibilityManager>
    );
};

const DateComponent = dynamic(() => import('@/components/Date'), {
    ssr: false,
    loading: () => <Loading />,
});

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    const closeHandler = () => dispatch({ type: 'close' });
    return <CButtons disabled withPadding onClickClose={closeHandler} onClickMinimise={closeHandler} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const components: Record<string, any> = { 
    CH, 
    ControlButtons, 
    Date: DateComponent, 
    GoogleAdsense, 
    Image 
};
