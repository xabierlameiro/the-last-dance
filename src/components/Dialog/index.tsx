import React, { ReactNode } from 'react';
import styles from './dialog.module.css';
import { clx } from '@/helpers';

type Props = {
    dialogRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;
    open?: boolean;
    withPadding?: boolean;
    modalMode?: boolean;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    large?: boolean;
    /** Accessible name for the window. Falls back to labelling by the header's content. */
    label?: string;
    /** Called on Escape. Omit for a window that has no way to close. */
    onClose?: () => void;
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
 * @param {string} label - Accessible name for the window
 * @param {Function} onClose - Invoked when Escape is pressed
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
        label,
        onClose,
    } = props;

    const headerId = React.useId();

    // Escape closes, when there is something to close. A window a keyboard user cannot dismiss is a
    // trap, and this primitive backs every page on the site.
    React.useEffect(() => {
        if (!open || !onClose) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    return (
        /**
         * SDD-L06. This was a plain `<div>`: no role, no accessible name, no focus management, no
         * Escape — on all eight pages of the site. A screen-reader user was never told a window had
         * opened or what it was called.
         *
         * `aria-modal` only in `modalMode`. The macOS-window premise means most of these are *not*
         * modal — the Dock and menu bar stay usable behind them — and claiming otherwise would tell
         * assistive tech the rest of the page is inert when it is not. Focus is likewise not trapped,
         * for the same reason.
         *
         * `inert` when closed is the important half, and it is what the audit could not settle
         * without a runtime check: `dialog.module.css` hides a closed window with
         * `transform: scale(0)`, which is purely visual. Its buttons and links stayed in the tab order
         * and in the accessibility tree, so a keyboard user could tab into an invisible window and a
         * screen reader would read out windows that were not on screen. `inert` removes both while
         * leaving the scale transition intact, which `display: none` would not.
         */
        <div
            ref={dialogRef}
            data-testid="dialog"
            role="dialog"
            aria-modal={modalMode ? true : undefined}
            aria-label={label}
            aria-labelledby={label ? undefined : headerId}
            inert={!open}
            className={clx(
                className,
                styles.dialog,
                open ? styles.open : '',
                withPadding ? styles.padding : '',
                modalMode ? styles.modalMode : '',
                large ? styles.large : ''
            )}
        >
            <header data-testid="dialog-header" id={headerId}>
                {header}
            </header>
            {/* SDD-L05: was <main>. Layout already wraps children in one, so every page shipped
                two landmarks — invalid, and it breaks the "skip to main content" idiom because a
                screen-reader user gets two ambiguous "main" regions. On the blog the real article
                sat inside the inner one. */}
            <div className={styles.body} data-testid="dialog-body">
                {body}
            </div>
            <footer data-testid="dialog-footer">{footer}</footer>
        </div>
    );
};

export default Dialog;
