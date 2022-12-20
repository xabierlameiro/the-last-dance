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
});
