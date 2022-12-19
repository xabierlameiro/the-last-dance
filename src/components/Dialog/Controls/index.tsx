import styles from './controls.module.css';

const Controls = () => {
    return (
        <div className={styles.ch_frame_buttons}>
            <div
                className={`${styles.ch_frame_button} ${styles.ch_frame_button_left}`}
            ></div>
            <div className={styles.ch_frame_button_space}></div>
            <div
                className={`${styles.ch_frame_button} ${styles.ch_frame_button_middle}`}
            ></div>
            <div className={styles.ch_frame_button_space}></div>
            <div
                className={`${styles.ch_frame_button} ${styles.ch_frame_button_right}`}
            ></div>
        </div>
    );
};

export default Controls;
