import { renderHook, act } from '@testing-library/react';
import { DialogProvider, useDialog } from '../dialog';

const wrapper = ({ children }: { children: React.ReactNode }) => <DialogProvider>{children}</DialogProvider>;

const renderDialog = () => renderHook(() => useDialog(), { wrapper });

describe('dialog context', () => {
    it('starts open with the language panel collapsed', () => {
        const { result } = renderDialog();

        expect(result.current.open).toBe(true);
        expect(result.current.lang).toBe(false);
    });

    it('closes and reopens through the explicit actions', () => {
        const { result } = renderDialog();

        act(() => result.current.dispatch({ type: 'close' }));
        expect(result.current.open).toBe(false);

        act(() => result.current.dispatch({ type: 'open' }));
        expect(result.current.open).toBe(true);
    });

    it('flips the open flag with alternate', () => {
        const { result } = renderDialog();

        act(() => result.current.dispatch({ type: 'alternate' }));
        expect(result.current.open).toBe(false);

        act(() => result.current.dispatch({ type: 'alternate' }));
        expect(result.current.open).toBe(true);
    });

    it('toggles the language flag without touching open', () => {
        const { result } = renderDialog();

        act(() => result.current.dispatch({ type: 'toggleLang' }));

        expect(result.current.lang).toBe(true);
        expect(result.current.open).toBe(true);
    });

    // The hook is useless outside its provider, so it must fail loudly rather than
    // hand back undefined and crash somewhere further down the tree.
    it('throws when used outside a DialogProvider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => renderHook(() => useDialog())).toThrow('useDialog must be used within a DialogProvider');

        consoleError.mockRestore();
    });
});
