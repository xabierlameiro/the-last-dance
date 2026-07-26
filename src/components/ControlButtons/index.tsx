import { useIntl } from 'react-intl';
import styles from './controls.module.css';
import { BiX, BiMinus, BiExpandAlt } from 'react-icons/bi';
import { clx } from '@/helpers';

type Props = {
    disabled?: boolean;
    withPadding?: boolean;
    onClickClose?: () => void;
    onClickMinimise?: () => void;
    onClickMaximise?: () => void;
};

/**
 * @example
 *     <ControlButtons />;
 *
 * @param {boolean} disabled - If true, the maximise button will be disabled
 * @param {boolean} withPadding - If true, the container will have padding
 * @param {Function} onClickClose - Callback function when close button is clicked
 * @param {Function} onClickMinimise - Callback function when minimise button is clicked
 * @param {Function} onClickMaximise - Callback function when maximise button is clicked
 * @returns {JSX.Element}
 */
const ControlButtons = ({ disabled, withPadding, onClickClose, onClickMinimise, onClickMaximise }: Props) => {
    const { formatMessage: f } = useIntl();

    return (
        /**
         * SDD-L05. These were three `<div onClick>` with no role, no tabIndex and no key handler, so
         * every window on the site could only be closed or minimised with a mouse. On the blog and legal
         * pages the close control is the only way out of the full-screen reading panel.
         *
         * Real `<button>`s now, which brings the accessible name, the role, keyboard activation and the
         * focus ring for free. `disabled` is the attribute rather than a CSS class: the old
         * `.ch_frame_button_disabled { pointer-events: none }` only stopped the mouse, leaving the
         * handler live for keyboard and programmatic activation.
         *
         * The labels were also hardcoded English ("Close"/"Minimise"/"Maximise") on a trilingual site.
         */
        <div data-testid="controls" className={clx(styles.ch_frame_buttons, withPadding ? styles.withPadding : '')}>
            <button
                type="button"
                onClick={onClickClose}
                data-testid="close"
                aria-label={f({ id: 'controls.close' })}
                className={clx(styles.ch_frame_button, styles.ch_frame_button_left)}
            >
                <BiX aria-hidden="true" />
            </button>
            <button
                type="button"
                data-testid="minimise"
                onClick={onClickMinimise}
                aria-label={f({ id: 'controls.minimise' })}
                className={clx(styles.ch_frame_button, styles.ch_frame_button_middle)}
            >
                <BiMinus aria-hidden="true" />
            </button>
            <button
                type="button"
                data-testid="maximise"
                onClick={onClickMaximise}
                // No caller passes onClickMaximise, so this control does nothing site-wide. Disabling it
                // when there is no handler is honest: it stops advertising an action that is not there,
                // and stops it taking a tab stop. Wiring or removing it is tracked in SDD-L08.
                disabled={disabled || !onClickMaximise}
                aria-label={f({ id: 'controls.maximise' })}
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_right,
                    disabled ? styles.ch_frame_button_disabled : ''
                )}
            >
                <BiExpandAlt aria-hidden="true" />
            </button>
        </div>
    );
};

export default ControlButtons;
