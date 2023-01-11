import styles from './search.module.css';

type Props = {
    disabled?: boolean;
    placeHolderText?: string;
    value?: string;
    onBlur?: () => void;
    onChange?: () => void;
};

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
