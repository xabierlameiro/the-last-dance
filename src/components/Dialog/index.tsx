import React, { ReactNode } from 'react';
import styles from './dialog.module.css';
import { clx } from '@/helpers';

type Props = {
    dialogRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    open?: boolean;
    withPadding?: boolean;
    modalMode?: boolean;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    large?: boolean;
};

/**
 * @example
 *     <Dialog
 *         dialogRef={dialogRef}
 *         open={open}
 *         withPadding={withPadding}
 *         modalMode={modalMode}
 *         header={<h1>Header</h1>}
 *         body={<p>Body</p>}
 *         footer={<button>Footer</button>}
 *         large={large}
 *     />;
 *
 * @param {React.RefObject<HTMLDivElement>} dialogRef - Ref to the dialog element
 * @param {boolean} open - If true, the dialog will be open
 * @param {boolean} withPadding - If true, the dialog will have padding
 * @param {boolean} modalMode - If true, the dialog will be not complete screen
 * @param {ReactNode} header - The header of the dialog
 * @param {ReactNode} body - The body of the dialog
 * @param {ReactNode} footer - The footer of the dialog
 * @param {boolean} large - If true, the dialog will be large
 * @returns {JSX.Element}
 */

const Dialog = (props: Props) => {
    const {
        dialogRef,
        className,
        open,
        large,
        withPadding,
        modalMode,
        header = <></>,
        body = <></>,
        footer = <></>,
    } = props;

    return (
        <div
            ref={dialogRef}
            data-testid="dialog"
            className={clx(
                className,
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
