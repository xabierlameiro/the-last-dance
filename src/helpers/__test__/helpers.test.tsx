import { clx } from '../';

describe('clx', () => {
    it('Should return empty string', () => {
        expect(clx()).toBe('');
        expect(clx('')).toBe('');
        expect(clx('')).toBe('');
    });
    it('Should return class name', () => {
        expect(clx('a')).toBe('a');
        expect(clx('a', 'b')).toBe('a b');
        expect(clx('a', 'b', 'c')).toBe('a b c');
    });
    it('Should return class name with condition', () => {
        expect(clx('a', true ? 'b' : '')).toBe('a b');
        expect(clx('a', false ? 'b' : '')).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '')).toBe('a b');
    });

    it('Should return class name with condition and null', () => {
        expect(clx('a', true ? 'b' : '', null)).toBe('a b');
        expect(clx('a', false ? 'b' : '', null)).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '', null)).toBe('a b');
    });

    it('Should return class name with condition and undefined', () => {
        expect(clx('a', true ? 'b' : '', undefined)).toBe('a b');
        expect(clx('a', false ? 'b' : '', undefined)).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '', undefined)).toBe('a b');
    });
});
