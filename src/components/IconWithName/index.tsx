import Image from 'next/image';
import styles from './icon.module.css';
import { clx } from '@/helpers';

type Props = {
    icon: string;
    alt: string;
    name: string;
    horizontal?: boolean;
    onClick?: () => void;
    /** Reflects on/off state to assistive tech when this acts as a toggle (e.g. the theme switch). */
    pressed?: boolean;
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
 * @param {Function} onClick - Makes this a button; omit it for a static tile
 * @param {boolean} pressed - Toggle state, forwarded as aria-pressed
 * @returns {JSX.Element}
 */
const IconWithName = ({ icon, alt, name, horizontal, onClick, pressed }: Props) => {
    const className = clx(styles.option, horizontal ? styles.horizontal : '');
    const content = (
        <>
            <Image src={icon} alt={alt} width={44} height={44} />
            <p className={styles.optionText}>{name}</p>
        </>
    );

    /**
     * SDD-L05: a `<div onClick>` with no role, tabIndex or key handler. It backs the theme and language
     * tiles on /settings — the two things that page exists to do — so neither could be operated without
     * a mouse.
     *
     * A `<button>` only when there is something to activate: a static tile should not take a tab stop
     * or announce itself as pressable.
     */
    if (!onClick) {
        return (
            <div data-testid="icon-with-name" className={className}>
                {content}
            </div>
        );
    }

    return (
        <button
            type="button"
            data-testid="icon-with-name"
            className={className}
            onClick={onClick}
            aria-pressed={pressed}
        >
            {content}
        </button>
    );
};
export default IconWithName;
