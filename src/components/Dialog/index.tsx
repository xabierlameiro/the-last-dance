import React from 'react';
import styles from './dialog.module.css';
import Controls from './Controls';

type Props = {
    children: React.ReactNode;
};

const Dialog = ({ children }: Props) => {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setIsOpen(true);
    }, []);

    return (
        <div className={`${styles.dialog} ${isOpen ? styles.open : ''}`}>
            <header>
                <Controls />
            </header>
            <main className={styles.content}>{children}</main>
            <footer></footer>
        </div>
    );
};

export default Dialog;
