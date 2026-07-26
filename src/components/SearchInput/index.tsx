import React from 'react';
import { useIntl } from 'react-intl';
import styles from './search.module.css';

type Props = {
    disabled?: boolean;
    placeHolderText?: string;
    value?: string;
    onBlur?: () => void;
    onChange?: () => void;
    /** Accessible name. Defaults to the shared `search.label` message. */
    label?: string;
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
 * @param {string} label - Accessible name for the field
 * @returns {JSX.Element}
 */
const SearchInput = ({ value, disabled, onBlur, onChange, placeHolderText, label }: Props) => {
    const { formatMessage: f } = useIntl();
    const id = React.useId();

    /**
     * SDD-L06. This had no label, no aria-label and no id — a placeholder was the only cue, and a
     * placeholder is not a label: it disappears the moment anything is typed, and voice-control users
     * have no name to speak. A screen reader announced "edit, blank".
     *
     * The placeholder also defaulted to a hardcoded English 'Search', and `ArticlePanel` renders this
     * with no prop at all — so every blog post showed an English placeholder in `es` and `gl`.
     *
     * `type="search"` rather than `text` so the field reports its purpose (1.3.5), and
     * `autoComplete="off"` because there is nothing here worth restoring.
     */
    return (
        <>
            <label htmlFor={id} className="visuallyHidden">
                {label ?? f({ id: 'search.label' })}
            </label>
            <input
                id={id}
                type="search"
                autoComplete="off"
                data-testid="search-input"
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                className={styles.input}
                disabled={disabled}
                placeholder={placeHolderText ?? f({ id: 'search.label' })}
            />
        </>
    );
};
export default SearchInput;
