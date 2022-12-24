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

const ControlButtons = ({
    disabled,
    withPadding,
    onClickClose,
    onClickMinimise,
    onClickMaximise,
}: Props) => {
    return (
        <div
            data-testid="controls"
            className={clx(
                styles.ch_frame_buttons,
                withPadding ? styles.withPadding : ''
            )}
        >
            <div
                onClick={onClickClose}
                data-testid="close"
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_left
                )}
            >
                <BiX title="Close" />
            </div>
            <div
                data-testid="minimise"
                onClick={onClickMinimise}
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_middle
                )}
            >
                <BiMinus title="Minimise" />
            </div>
            <div
                data-testid="maximise"
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

export default ControlButtons;
