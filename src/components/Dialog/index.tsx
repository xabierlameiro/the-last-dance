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
            className={`${styles.dialog} ${withPadding ? styles.padding : ''} ${
                open ? styles.open : ''
            } ${modalMode ? styles.modalMode : ''}`}
        >
            <header data-testid="modal-header">{header()}</header>
            <main data-testid="modal-body">{body()}</main>
            <footer data-testid="modal-footer">{footer()}</footer>
        </div>
    );
};

export default Dialog;
