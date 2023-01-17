import Image from 'next/image';
import styles from './icon.module.css';
import { clx } from '@/helpers';

type Props = {
    icon: string;
    alt: string;
    name: string;
    horizontal?: boolean;
};

/**
 * @example
 *     <IconWithName icon="/images/icons/terminal.svg" alt="Terminal" name="Terminal" />;
 *     <IconWithName icon="/images/icons/terminal.svg" alt="Terminal" name="Terminal" horizontal />;
 *
 * @param {string} icon - The path to the icon
 * @param {string} alt - The alt text for the icon
 * @param {string} name - Text to display
 * @param {boolean} horizontal - If true, the icon will be displayed horizontally
 * @returns {JSX.Element}
 */
const IconWithName = ({ icon, alt, name, horizontal }: Props) => {
    return (
        <div data-testid="icon-with-name" className={clx(styles.option, horizontal ? styles.horizontal : '')}>
            <Image src={icon} alt={alt} width={44} height={42} />
            <p className={styles.optionText}>{name}</p>
        </div>
    );
};
export default IconWithName;
