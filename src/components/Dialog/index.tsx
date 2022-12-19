import React from 'react';
import styles from './dialog.module.css';
import Controls from './Controls';

type Props = {
    open?: boolean;
    children: React.ReactNode;
    onClickClose?: () => Function | void;
    onClickMinimise?: () => Function | void;
    onClickMaximise?: () => Function | void;
};

const Dialog = (props: Props) => {
    const { open, children, ...rest } = props;
    return (
        <div className={`${styles.dialog} ${open ? styles.open : ''}`}>
            <header>
                <Controls {...rest} />
            </header>
            <main className={styles.content}>{children}</main>
            <footer></footer>
        </div>
    );
};

export default Dialog;
