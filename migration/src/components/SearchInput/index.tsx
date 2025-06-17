import styles from './search.module.css';

type Props = {
    disabled?: boolean;
    placeHolderText?: string;
    value?: string;
    onBlur?: () => void;
    onChange?: () => void;
};

/**
 * @example
 *     <SearchInput />;
 *
 * @param {string} value - The value of the input
 * @param {boolean} disabled - If true, the input will be disabled
 * @param {Function} onBlur - Callback function when input is blurred
 * @param {Function} onChange - Callback function when input is changed
 * @param {string} placeHolderText - The placeholder text for the input
 * @returns {JSX.Element}
 */
const SearchInput = ({ value, disabled, onBlur, onChange, placeHolderText = 'Search' }: Props) => {
    return (
        <input
            type="text"
            data-testid="search-input"
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            className={styles.input}
            disabled={disabled}
            placeholder={placeHolderText}
        />
    );
};
export default SearchInput;
