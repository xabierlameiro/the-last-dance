import Image from 'next/image';
import styles from './icon.module.css';
import { clx } from '@/helpers';

type Props = {
    icon: string;
    alt: string;
    name: string;
    horizontal?: boolean;
};

const IconWithName = ({ icon, alt, name, horizontal }: Props) => {
    return (
        <div data-testid="icon-with-name" className={clx(styles.option, horizontal ? styles.horizontal : '')}>
            <Image src={icon} alt={alt} width={44} height={42} />
            <p className={styles.optionText}>{name}</p>
        </div>
    );
};
export default IconWithName;
