import Image from 'next/image';
import styles from './icon.module.css';

type Props = {
    icon: string;
    alt: string;
    name: string;
};

const IconWithName = ({ icon, alt, name }: Props) => {
    return (
        <div className={styles.option}>
            <Image src={icon} alt={alt} width={44} height={42} />
            <p className={styles.optionText}>{name}</p>
        </div>
    );
};
export default IconWithName;
