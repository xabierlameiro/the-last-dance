import React from 'react';
import styles from './dialog.module.css';

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

    // if (!open) return null;

    return (
        <div
            data-testid="dialog"
            className={`${styles.dialog} ${withPadding ? styles.padding : ''} ${
                open ? styles.open : ''
            } ${modalMode ? styles.modalMode : ''}`}
        >
            <header data-testid="dialog-header">{header()}</header>
            <main data-testid="dialog-body">{body()}</main>
            <footer data-testid="dialog-footer">{footer()}</footer>
        </div>
    );
};

export default Dialog;
