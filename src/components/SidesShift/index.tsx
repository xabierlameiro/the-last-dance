import styles from './sides.module.css';
import { TfiMinus } from 'react-icons/tfi';
import { clx } from '@/helpers';

type Props = {
    handleClick?: () => void;
    leftPosition?: boolean;
};

const ShidesShift = ({ handleClick, leftPosition }: Props) => {
    return <TfiMinus className={clx(styles.swap, leftPosition ? styles.left : '')} onClick={handleClick} />;
};

export default ShidesShift;
