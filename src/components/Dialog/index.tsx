import React, { ReactNode } from 'react';
import styles from './dialog.module.css';
import { clx } from '@/helpers';

type Props = {
    dialogRef?: React.RefObject<HTMLDivElement>;
    open?: boolean;
    withPadding?: boolean;
    modalMode?: boolean;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    large?: boolean;
};

const Dialog = (props: Props) => {
    const { dialogRef, open, large, withPadding, modalMode, header = <></>, body = <></>, footer = <></> } = props;

    return (
        <div
            ref={dialogRef}
            data-testid="dialog"
            className={clx(
                styles.dialog,
                open ? styles.open : '',
                withPadding ? styles.padding : '',
                modalMode ? styles.modalMode : '',
                large ? styles.large : ''
            )}
        >
            <header data-testid="dialog-header">{header}</header>
            <main className={styles.body} data-testid="dialog-body">
                {body}
            </main>
            <footer data-testid="dialog-footer">{footer}</footer>
        </div>
    );
};

export default Dialog;
