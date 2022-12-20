import styles from './search.module.css';

type Props = {
    disabled?: boolean;
    placeHolderText?: string;
    value?: string;
    onBlur?: () => void;
    onChange?: () => void;
};

const SearchInput = ({
    value,
    disabled,
    onBlur,
    onChange,
    placeHolderText = 'Search',
}: Props) => {
    return (
        <input
            type="text"
            data-testid="search-input"
            onBlur={onBlur}
            onChange={onChange}
            className={styles.input}
            disabled={disabled}
            value={value}
            placeholder={placeHolderText}
        />
    );
};
export default SearchInput;
