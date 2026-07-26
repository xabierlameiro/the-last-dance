import styles from './sides.module.css';
import { TfiMinus } from 'react-icons/tfi';
import { clx } from '@/helpers';

type Props = {
    handleClick?: () => void;
    leftPosition?: boolean;
    className?: string;
    /** Accessible name. Required whenever `handleClick` is given, since the icon carries no text. */
    label?: string;
    /** Whether the panel this grabber controls is currently open, forwarded as aria-expanded. */
    expanded?: boolean;
};

/**
 * @example
 *     <SidesShift />;
 *     <SidesShift handleClick={toggle} label="Show posts" expanded={open} />;
 *
 * @param {function} handleClick - Makes this a real button; omit it for a decorative grabber
 * @param {boolean} leftPosition - If true, the button will be positioned on the left
 * @param {string} label - Accessible name, required alongside handleClick
 * @param {boolean} expanded - Panel open state, forwarded as aria-expanded
 * @returns {JSX.Element}
 */
const SidesShift = ({ handleClick, leftPosition, className, label, expanded }: Props) => {
    const iconClass = clx(styles.swap, className, leftPosition ? styles.left : '');

    /**
     * SDD-L05. This was a bare `<svg onClick>`, so the grabber that *looks* like the affordance for the
     * blog's side panels was not focusable, had no role and no accessible name. Worse, the two call
     * sites on the post page passed no `handleClick` at all — the visible handle did nothing, and the
     * real (undiscoverable) gesture was `onTouchStart` on the panel itself, which no keyboard or mouse
     * user can perform. Between 768px and 900px that left the categories and post-list navigation
     * completely unreachable.
     *
     * A real button when there is something to toggle, and a decorative icon when there is not — a
     * handle that does nothing should not take a tab stop or claim to be pressable.
     */
    if (!handleClick) {
        return <TfiMinus data-testid="sides-shift" className={iconClass} aria-hidden="true" />;
    }

    return (
        <button
            type="button"
            data-testid="sides-shift"
            className={styles.grabber}
            onClick={handleClick}
            aria-label={label}
            aria-expanded={expanded}
        >
            <TfiMinus className={iconClass} aria-hidden="true" />
        </button>
    );
};

export default SidesShift;
