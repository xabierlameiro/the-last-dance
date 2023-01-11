import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import styles from './navigation.module.css';

type Props = {
    disabledLeft?: boolean;
    disabledRight?: boolean;
    onClickRight?: () => void;
    onClickLeft?: () => void;
};

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
