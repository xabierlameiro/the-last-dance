'use client';

import styles from './controls.module.css';
import { BiX, BiMinus, BiExpandAlt } from 'react-icons/bi';
import { clx } from '@/helpers';

type Props = {
    disabled?: boolean;
    withPadding?: boolean;
    onClickClose?: () => Function | void;
    onClickMinimise?: () => Function | void;
    onClickMaximise?: () => Function | void;
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
    return (
        <div data-testid="controls" className={clx(styles.ch_frame_buttons, withPadding ? styles.withPadding : '')}>
            <button
                onClick={onClickClose}
                data-testid="close"
                className={clx(styles.ch_frame_button, styles.ch_frame_button_left)}
                type="button"
                aria-label="Close"
            >
                <BiX title="Close" />
            </button>
            <button
                data-testid="minimise"
                onClick={onClickMinimise}
                className={clx(styles.ch_frame_button, styles.ch_frame_button_middle)}
                type="button"
                aria-label="Minimise"
            >
                <BiMinus title="Minimise" />
            </button>
            <button
                data-testid="maximise"
                onClick={onClickMaximise}
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_right,
                    disabled ? styles.ch_frame_button_disabled : ''
                )}
                type="button"
                aria-label="Maximise"
                disabled={disabled}
            >
                <BiExpandAlt title="Maximise" />
            </button>
        </div>
    );
};

export default ControlButtons;
