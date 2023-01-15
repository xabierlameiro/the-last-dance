import { Layout, Dialog, ControlButtons } from '@/components';
import { useDialog } from '@/context/dialog';
import { DialogProvider } from '@/context/dialog';

const Custom404 = () => {
    const { dispatch, open } = useDialog();
    const close = () => dispatch({ type: 'close' });

    return (
        <Layout
            meta={{
                title: '404',
                description: "Oh! sorry, this page doesn't exist",
                noindex: true,
            }}
        >
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
        </Layout>
    );
};

export default function Page(props: any) {
    return (
        <DialogProvider>
            <Custom404 {...props} />
        </DialogProvider>
    );
}
