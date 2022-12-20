import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import styles from './navigation.module.css';

const NavigationArrows = () => {
    return (
        <nav className={styles.nav}>
            <BiChevronLeft />
            <BiChevronRight />
        </nav>
    );
};

export default NavigationArrows;
