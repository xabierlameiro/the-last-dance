import React from 'react';
import styles from './dialog.module.css';
import { clx } from '@/helpers';

type Props = {
    open?: boolean;
    withPadding?: boolean;
    modalMode?: boolean;
    header?: () => JSX.Element;
    body?: () => JSX.Element;
    footer?: () => JSX.Element;
};

const Dialog = (props: Props) => {
    const {
        open,
        withPadding,
        modalMode,
        header = () => <></>,
        body = () => <></>,
        footer = () => <></>,
    } = props;

    return (
        <div
            data-testid="dialog"
            className={clx(
                styles.dialog,
                open ? styles.open : '',
                withPadding ? styles.padding : '',
                modalMode ? styles.modalMode : ''
            )}
        >
            <header data-testid="dialog-header">{header()}</header>
            <main className={styles.body} data-testid="dialog-body">
                {body()}
            </main>
            <footer data-testid="dialog-footer">{footer()}</footer>
        </div>
    );
};

export default Dialog;
