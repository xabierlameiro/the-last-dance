import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import styles from './navigation.module.css';

type Props = {
    disabledLeft?: boolean;
    disabledRight?: boolean;
    onClickRight?: () => void;
    onClickLeft?: () => void;
};

/**
 * @example
 *     <NavigationArrows />;
 *
 * @param {boolean} disabledLeft - If true, the left arrow will be disabled
 * @param {boolean} disabledRight - If true, the right arrow will be disabled
 * @param {Function} onClickLeft - Callback function when left arrow is clicked
 * @param {Function} onClickRight - Callback function when right arrow is clicked
 * @returns {JSX.Element}
 */
const NavigationArrows = ({ disabledLeft, onClickLeft, disabledRight, onClickRight }: Props) => {
    return (
        <nav className={styles.nav}>
            <BiChevronLeft className={disabledLeft ? styles.disabled : ''} data-testid="left" onClick={onClickLeft} />
            <BiChevronRight
                className={disabledRight ? styles.disabled : ''}
                data-testid="right"
                onClick={onClickRight}
            />
        </nav>
    );
};

export default NavigationArrows;
