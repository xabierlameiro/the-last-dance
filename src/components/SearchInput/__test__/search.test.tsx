import SearchInput from '..';
import { fireEvent, render, screen } from '@/test';

describe('SearchInput component', () => {
    it('Should dispatch events ', () => {
        const onBlur = jest.fn();
        const onChange = jest.fn();

        render(<SearchInput onBlur={onBlur} onChange={onChange} />);
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test' } });
        expect(onChange).toHaveBeenCalledTimes(1);

        fireEvent.blur(searchInput);
        expect(onBlur).toHaveBeenCalledTimes(1);

        fireEvent.change(searchInput, { target: { value: 'Hello World' } });
        expect((searchInput as HTMLInputElement).value).toBe('Hello World');
    });

    /**
     * SDD-L06. This field had no label, no aria-label and no id: a placeholder was the only cue, and
     * a placeholder is not a label — it vanishes on first keystroke and gives voice-control users
     * nothing to say. A screen reader announced "edit, blank".
     *
     * The intl mock returns message ids, so the accessible name reads as `search.label` here.
     */
    it('Should have an accessible name', () => {
        render(<SearchInput />);

        expect(screen.getByRole('searchbox')).toHaveAccessibleName('search.label');
    });

    it('Should accept an explicit label', () => {
        render(<SearchInput label="Find a legal document" />);

        expect(screen.getByRole('searchbox')).toHaveAccessibleName('Find a legal document');
    });

    // `type="search"` reports the field's purpose (WCAG 1.3.5); it was `text`.
    it('Should be a search field, with autocomplete off', () => {
        render(<SearchInput />);
        const input = screen.getByTestId('search-input');

        expect(input).toHaveAttribute('type', 'search');
        expect(input).toHaveAttribute('autocomplete', 'off');
    });

    // The default placeholder used to be a hardcoded English 'Search', and ArticlePanel renders this
    // with no prop — so every blog post showed English placeholder text in es and gl.
    it('Should take its default placeholder from the catalogue, not a hardcoded string', () => {
        render(<SearchInput />);

        expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'search.label');
    });
});
