import { createIntlCache } from 'react-intl';
import { createGalicianIntl } from '../galician';
import gl from '../messages/gl';

// The suite-wide mock replaces react-intl with functions that echo their input.
jest.unmock('react-intl');

const NBSP = '\u00a0';
const INSTANT = new Date('2023-02-03T09:05:07Z');

const createIntl = (messages: Record<string, string> = {}) =>
    createGalicianIntl({ messages, timeZone: 'UTC', onError: () => undefined }, createIntlCache());

/**
 * Every expectation here is a string Node (ICU 78, CLDR 48) wrote for `gl` before this module
 * existed, so the server's output is pinned. They are literals rather than a comparison against the
 * native formatter on purpose: jsdom formats with Node's data, which is exactly the data a browser
 * does not have, and a test that asked it would pass on a machine where the defect cannot happen.
 */
describe('Galician formatting', () => {
    it('should keep the locale the page was asked for', () => {
        expect(createIntl().locale).toBe('gl');
    });

    it.each([
        [{ day: 'numeric', month: 'short', year: 'numeric' }, '3 de feb. de 2023'],
        [{ dateStyle: 'medium' }, '3 de feb. de 2023'],
        [{ dateStyle: 'long' }, '3 de febreiro de 2023'],
        [{ dateStyle: 'full' }, 'venres, 3 de febreiro de 2023'],
        [{ dateStyle: 'short' }, '03/02/23'],
        [{ dateStyle: 'medium', timeStyle: 'short' }, '3 de feb. de 2023, 09:05'],
        [{ dateStyle: 'short', timeStyle: 'medium' }, '03/02/23, 09:05:07'],
        [{ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }, 'ven., 3 de feb. de 2023'],
        [{ weekday: 'long', day: 'numeric', month: 'long' }, 'venres, 3 de febreiro'],
        [{ month: 'long', year: 'numeric' }, 'febreiro de 2023'],
        [{ day: 'numeric', month: 'numeric', year: 'numeric' }, '3/2/2023'],
        [{ weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }, 'venres, 3/2/2023'],
        [{ weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' }, 'ven., 03/02/23'],
        [{ day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }, '3/2/2023, 09:05'],
        [{ day: '2-digit', month: 'short', year: '2-digit' }, '03 de feb. de 23'],
        [{ month: 'numeric', year: 'numeric' }, '2/2023'],
        [{ weekday: 'short', hour: 'numeric', minute: 'numeric' }, 'ven., 09:05'],
        [{ hour: 'numeric', minute: 'numeric', second: 'numeric' }, '09:05:07'],
        [{ weekday: 'short' }, 'ven.'],
        [{ day: 'numeric' }, '3'],
        [{ month: 'short' }, 'feb.'],
        [{ year: 'numeric' }, '2023'],
        [{ hour: 'numeric', minute: 'numeric' }, '09:05'],
        [{ hour: 'numeric' }, '09'],
        [{}, '3/2/2023'],
    ] as const)('should write %j as %s', (options, expected) => {
        expect(createIntl().formatDate(INSTANT, options)).toBe(expected);
    });

    it('should name the twelve months and the seven days', () => {
        const intl = createIntl();
        const months = Array.from({ length: 12 }, (_, month) =>
            intl.formatDate(new Date(Date.UTC(2023, month, 15)), { month: 'short' })
        );
        const days = Array.from({ length: 7 }, (_, day) =>
            intl.formatDate(new Date(Date.UTC(2023, 0, 1 + day)), { weekday: 'long' })
        );

        expect(months).toEqual([
            'xan.',
            'feb.',
            'mar.',
            'abr.',
            'maio',
            'xuño',
            'xul.',
            'ago.',
            'set.',
            'out.',
            'nov.',
            'dec.',
        ]);
        expect(days).toEqual(['domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado']);
    });

    it('should read the calendar day in the time zone it is given', () => {
        const intl = createIntl();

        // A date-only string is UTC midnight, which is still the evening before in California.
        expect(intl.formatDate('2023-02-03', { dateStyle: 'medium' })).toBe('3 de feb. de 2023');
        expect(intl.formatDate('2023-02-03', { dateStyle: 'medium', timeZone: 'America/Los_Angeles' })).toBe(
            '2 de feb. de 2023'
        );
    });

    it('should write a time as hours and minutes when no field is asked for', () => {
        expect(createIntl().formatTime(INSTANT)).toBe('09:05');
        expect(createIntl().formatTime(new Date('2023-12-31T00:00:00Z'))).toBe('00:00');
    });

    it('should add no time to a date style, as react-intl does not', () => {
        expect(createIntl().formatTime(INSTANT, { dateStyle: 'medium' })).toBe('3 de feb. de 2023');
    });

    it.each([
        [2504, undefined, '2.504'],
        [999, undefined, '999'],
        [1234567.891, undefined, '1.234.567,891'],
        [1.33, { style: 'currency', currency: 'EUR' }, `1,33${NBSP}€`],
        [0.127, { style: 'percent' }, `13${NBSP}%`],
    ] as const)('should write the number %d with %j as %s', (value, options, expected) => {
        expect(createIntl().formatNumber(value, options)).toBe(expected);
    });

    it('should format the numbers and plurals inside a message the same way', () => {
        const intl = createIntl({
            pages: 'Sen heap tras {first, number} de {pages, number} páxinas',
            findings: '{count, plural, one {# achado} other {# achados}}',
        });

        expect(intl.formatMessage({ id: 'pages' }, { first: 1617, pages: 2504 })).toBe(
            'Sen heap tras 1.617 de 2.504 páxinas'
        );
        expect(intl.formatMessage({ id: 'findings' }, { count: 1 })).toBe('1 achado');
        expect(intl.formatMessage({ id: 'findings' }, { count: 1200 })).toBe('1.200 achados');
    });

    it.each([
        [-6, 'minute', 'hai 6 minutos'],
        [-1, 'minute', 'hai 1 minuto'],
        [0, 'minute', 'este minuto'],
        [-1, 'hour', 'hai 1 hora'],
        [-3, 'hour', 'hai 3 horas'],
        [-1, 'day', 'onte'],
        [-2, 'day', 'antonte'],
        [-5, 'day', 'hai 5 días'],
        [1, 'day', 'mañá'],
        [3, 'minute', 'en 3 minutos'],
    ] as const)('should write %d %s as %s', (value, unit, expected) => {
        expect(createIntl().formatRelativeTime(value, unit, { numeric: 'auto' })).toBe(expected);
    });

    /**
     * The point of the module. Whatever these formatters hand to the native `Intl`, it must not be
     * `gl`: that is the one request a browser answers in its own language.
     */
    it('should never ask the native Intl for Galician', () => {
        // Created before the spies go in: a spied constructor has none of the static methods
        // react-intl checks the locale with, and the formatters themselves are built on first use.
        const intl = createIntl({ message: '{count, plural, one {# achado} other {# achados}} de {total, number}' });
        const spies = [
            jest.spyOn(Intl, 'DateTimeFormat'),
            jest.spyOn(Intl, 'NumberFormat'),
            jest.spyOn(Intl, 'PluralRules'),
            jest.spyOn(Intl, 'RelativeTimeFormat'),
        ];

        intl.formatDate(INSTANT, { dateStyle: 'long', timeStyle: 'short' });
        intl.formatTime(INSTANT);
        intl.formatNumber(2504);
        intl.formatRelativeTime(-3, 'hour', { numeric: 'auto' });
        intl.formatMessage({ id: 'message' }, { count: 1200, total: 2504 });

        const locales = spies.flatMap((spy) => spy.mock.calls.map(([locale]) => String(locale)));
        spies.forEach((spy) => spy.mockRestore());

        expect(locales.length).toBeGreaterThan(0);
        expect(locales).not.toContain('gl');
    });

    it.each([
        [{ month: 'narrow' }],
        [{ day: 'numeric', year: 'numeric' }],
        [{ weekday: 'short', day: 'numeric' }],
        [{ minute: 'numeric' }],
        [{ hour: 'numeric', second: 'numeric' }],
        [{ hour: 'numeric', hour12: true }],
        [{ dateStyle: 'medium', timeStyle: 'long' }],
    ] as const)('should fall back to the native formatter, and say so, for %j', (options) => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const written = createIntl().formatDate(INSTANT, options);
        const reported = error.mock.calls.map(([message]) => String(message));
        error.mockRestore();

        expect(written).toBe(new Intl.DateTimeFormat('gl', { ...options, timeZone: 'UTC' }).format(INSTANT));
        expect(reported).toEqual([expect.stringContaining(`formatDate cannot write ${JSON.stringify(options)}`)]);
    });

    /**
     * Messages are formatted by the carrier locale, which is right for digits and wrong for words:
     * a `{value, date}` argument would print a German month in a Galician sentence.
     */
    it('should have no date or time argument in the Galician catalogue', () => {
        const offenders = Object.entries(gl).filter(([, message]) => /\{\s*\w+\s*,\s*(date|time)\b/.test(message));

        expect(offenders).toEqual([]);
    });
});
