import styles from './sides.module.css';
import { TfiMinus } from 'react-icons/tfi';
import { clx } from '@/helpers';

type Props = {
    handleClick?: () => void;
    leftPosition?: boolean;
    className?: string;
};

/**
 * @example
 *     <SidesShift />;
 *
 * @param {function} handleClick - The function to be called when the button is clicked
 * @param {boolean} leftPosition - If true, the button will be positioned on the left
 * @returns {JSX.Element}
 */
const ShidesShift = ({ handleClick, leftPosition, className }: Props) => {
    return (
        <TfiMinus
            data-testid="sides-shift"
            className={clx(styles.swap, className, leftPosition ? styles.left : '')}
            onClick={handleClick}
        />
    );
};

export default ShidesShift;
