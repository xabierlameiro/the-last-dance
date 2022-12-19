import styles from './dock.module.css';
import { iconUrls } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';
import Dialog from '@/components/Dialog';
import React from 'react';

const Dock = () => {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <nav className={styles.dock}>
                <ul>
                    {iconUrls.map((iconUrl, index) => (
                        <li key={index} onClick={() => setOpen((e) => !e)}>
                            <Icon src={iconUrl.url} alt={iconUrl.alt} />
                        </li>
                    ))}
                </ul>
            </nav>
            <Dialog open={open}>{}</Dialog>
        </>
    );
};

export default Dock;
