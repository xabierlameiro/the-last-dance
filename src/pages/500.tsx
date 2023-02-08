import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { useDialog } from '@/context/dialog';
import SEO from '@/components/SEO';

const Custom500 = () => {
    const { dispatch, open } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: '500',
                    description: 'Oh! sorry, a server error has occurred!',
                    noindex: true,
                }}
            />
            <Dialog
                modalMode
                withPadding
                header={<ControlButtons disabled onClickClose={close} onClickMinimise={close} />}
                open={open}
                body={
                    <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
                        Oh! sorry, a server error has occurred!
                    </div>
                }
            />
        </>
    );
};

export default Custom500;
