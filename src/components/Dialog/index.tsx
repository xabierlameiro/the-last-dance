import React from 'react';
import styles from './dialog.module.css';
import Controls from './Controls';

type Props = {
    open: boolean;
    children: React.ReactNode;
};

const Dialog = ({ open, children }: Props) => {
    return (
        <div className={`${styles.dialog} ${open ? styles.open : ''}`}>
            <header>
                <Controls />
            </header>
            <main>{children}</main>
            <footer></footer>
        </div>
    );
};

export default Dialog;
