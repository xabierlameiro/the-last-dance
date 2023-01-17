import React from 'react';
import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import { DialogProvider } from '@/context/dialog';
import ControlButtons from '@/components/ControlButtons';
import { AiFillFolder } from 'react-icons/ai';
import styles from '@/styles/comments.module.css';
import Data from '../data/comments/index.mdx';
import { useIntl } from 'react-intl';

const Comments = () => {
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const { formatMessage: f } = useIntl();
    const [height, setHeight] = React.useState(0);
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        if (dialogRef.current) {
            setHeight(dialogRef.current.clientHeight);
            setWidth(dialogRef.current.clientWidth);
        }
    }, [dialogRef]);

    return (
        <Layout
            className="comments"
            meta={{
                title: f({ id: 'comments.seo.title' }),
                description: f({ id: 'comments.seo.description' }),
            }}
        >
            <Dialog
                open
                modalMode
                dialogRef={dialogRef}
                header={
                    <div className={styles.header}>
                        <ControlButtons />

                        <div>
                            <AiFillFolder />
                            xabier.lameirocardama - bash - {width}x{height}
                        </div>
                    </div>
                }
                body={<Data />}
            />
        </Layout>
    );
};

export default function Page(props: any) {
    return (
        <DialogProvider>
            <Comments {...props} />
        </DialogProvider>
    );
}
