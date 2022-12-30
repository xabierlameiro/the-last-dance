import styles from './aside.module.css';
import { SlList, SlGrid } from 'react-icons/sl';
import { IoTrashOutline } from 'react-icons/io5';

const AsidePanel = () => {
    return (
        <div className={styles.controls}>
            <SlList size={18} />
            <SlGrid size={14} />
            <IoTrashOutline size={19} />
        </div>
    );
};

export default AsidePanel;
