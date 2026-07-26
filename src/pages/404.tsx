import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
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
            {/* SDD-L05: this page rendered with no heading at all, so heading navigation found
                nothing and the document had no programmatic title. The window chrome is the visual
                title in this design, so the <h1> is visually hidden rather than bolted on. */}
            {/* Plain English for now: this whole page is hardcoded English, and translating
                only the heading would be inconsistent. SDD-L08 localises these pages. */}
            <h1 className="visuallyHidden">Page not found</h1>
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
