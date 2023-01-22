import { Dialog, ControlButtons } from '@/components';
import { useDialog } from '@/context/dialog';
import SEO from '@/components/SEO';

const Custom404 = () => {
    const { dispatch, open } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: '404',
                    description: "Oh! sorry, this page doesn't exist",
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
                        Oh! sorry, this page doesn&apos;t exist.
                    </div>
                }
            />
        </>
    );
};

export default Custom404;
