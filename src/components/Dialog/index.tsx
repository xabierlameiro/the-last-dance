import React from 'react';
import styles from './dialog.module.css';
import Controls from './Controls';
import NavigationArrows from './NavigationArrows';
import { CgLayoutGridSmall } from 'react-icons/cg';
import SearchInput from './Search';

type Props = {
    modal?: boolean;
    showControls?: boolean;
    open?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    onClickClose?: () => Function | void;
    onClickMinimise?: () => Function | void;
    onClickMaximise?: () => Function | void;
};

const Dialog = (props: Props) => {
    const {
        open,
        children,
        modal,
        disabled = false,
        showControls = false,
        ...rest
    } = props;
    return (
        <div
            className={`${styles.dialog} ${open ? styles.open : ''} ${
                modal ? styles.modal : ''
            }`}
        >
            <header className={styles.header}>
                <Controls {...rest} disabled={disabled} />
                {showControls && (
                    <>
                        <NavigationArrows />
                        <CgLayoutGridSmall className={styles.layoutIcon} />
                        <h1 className={styles.title}>System Preferences</h1>
                        <SearchInput />
                    </>
                )}
            </header>
            <main className={styles.content}>{children}</main>
            <footer></footer>
        </div>
    );
};

export default Dialog;
