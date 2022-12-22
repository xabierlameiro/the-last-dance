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

const Controls = ({
    disabled,
    withPadding,
    onClickClose,
    onClickMinimise,
    onClickMaximise,
}: Props) => {
    return (
        <div
            data-testid="controls"
            className={`${styles.ch_frame_buttons} ${
                withPadding ? styles.withPadding : ''
            }`}
        >
            <div
                onClick={onClickClose}
                aria-label="close"
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_left
                )}
            >
                <BiX title="Close" />
            </div>
            <div
                aria-label="minimise"
                onClick={onClickMinimise}
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_middle
                )}
            >
                <BiMinus title="Minimise" />
            </div>
            <div
                aria-label="maximise"
                onClick={onClickMaximise}
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_right,
                    disabled ? styles.ch_frame_button_disabled : ''
                )}
            >
                <BiExpandAlt title="Maximise" />
            </div>
        </div>
    );
};

export default Controls;
