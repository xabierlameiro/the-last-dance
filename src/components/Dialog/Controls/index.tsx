import styles from './controls.module.css';
import { BiX, BiMinus, BiExpandAlt } from 'react-icons/bi';

export function clx(...classes: string[]) {
    return classes.join(' ');
}

type Props = {
    disabled?: boolean;
    onClickClose?: () => Function | void;
    onClickMinimise?: () => Function | void;
    onClickMaximise?: () => Function | void;
};

const Controls = ({
    disabled,
    onClickClose,
    onClickMinimise,
    onClickMaximise,
}: Props) => {
    return (
        <div data-testid="controls" className={styles.ch_frame_buttons}>
            <div
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_left
                )}
            >
                <BiX aria-label="close" onClick={onClickClose} title="Close" />
            </div>
            <div
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_middle
                )}
            >
                <BiMinus
                    aria-label="minimise"
                    onClick={onClickMinimise}
                    title="Minimise"
                />
            </div>
            <div
                className={clx(
                    styles.ch_frame_button,
                    styles.ch_frame_button_right,
                    disabled ? styles.ch_frame_button_disabled : ''
                )}
            >
                <BiExpandAlt
                    aria-label="maximise"
                    onClick={onClickMaximise}
                    title="Maximise"
                />
            </div>
        </div>
    );
};

export default Controls;
