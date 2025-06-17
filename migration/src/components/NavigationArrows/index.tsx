import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import styles from './navigation.module.css';

type Props = {
    hidden?: boolean;
    disabledLeft?: boolean;
    disabledRight?: boolean;
    onClickRight?: () => void;
    onClickLeft?: () => void;
};

/**
 * @example
 *     <NavigationArrows />;
 *
 * @param {boolean} hidden - If true, the arrows will be hidden
 * @param {boolean} disabledLeft - If true, the left arrow will be disabled
 * @param {boolean} disabledRight - If true, the right arrow will be disabled
 * @param {Function} onClickLeft - Callback function when left arrow is clicked
 * @param {Function} onClickRight - Callback function when right arrow is clicked
 * @returns {JSX.Element}
 */
const NavigationArrows = ({ hidden, disabledLeft, onClickLeft, disabledRight, onClickRight }: Props) => {
    if (hidden) return null;

    return (
        <nav className={styles.nav}>
            <SlArrowLeft className={disabledLeft ? styles.disabled : ''} data-testid="left" onClick={onClickLeft} />
            <SlArrowRight className={disabledRight ? styles.disabled : ''} data-testid="right" onClick={onClickRight} />
        </nav>
    );
};

export default NavigationArrows;
