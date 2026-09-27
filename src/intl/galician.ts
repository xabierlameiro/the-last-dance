import { createIntl, type IntlCache, type IntlConfig, type IntlShape } from 'react-intl';

/**
 * Galician formatting that does not depend on the reader's browser.
 *
 * react-intl formats with the native `Intl`, and Chromium ships no Galician data:
 * `Intl.DateTimeFormat.supportedLocalesOf(['gl'])` is empty there, so `gl` resolves to the browser's
 * own language. Node has the data. The server wrote `3 de feb. de 2023` and `2.504`, an English
 * browser hydrated `Feb 3, 2023` and `2,504`, and React threw #418 on every Galician page that
 * prints a date or a number above 999.
 *
 * Not a polyfill. `@formatjs/intl-datetimeformat` and `@formatjs/intl-numberformat` replace the
 * native classes for every locale on the page and weigh more than the page's own code, and they
 * still would not guarantee the match: the server would keep formatting with Node's ICU, whose
 * CLDR version is not theirs. What guarantees it is running the same code on both sides.
 *
 * - Dates come from the tables below. The strings are the ones Node (ICU 78, CLDR 48) produced, so
 *   the server's output does not change.
 * - Numbers and plurals go through German. It is a carrier, not a translation: `de` writes `2.504`,
 *   `0,5`, `1,33 €` and `13 %` exactly as `gl` does and has the same two plural categories, and
 *   every browser ships it. Spanish and Portuguese do not group four digits.
 *
 * Still native, so still the browser's language on a Galician page: `formatDateToParts`,
 * `formatTimeToParts`, `formatDateTimeRange`, `formatList` and `formatDisplayName`. Nothing uses
 * them. A `{value, date}` or `{value, time}` argument inside a Galician message would be formatted
 * by the carrier, in German; `galician.test.ts` fails if one is ever added.
 */
const NUMBER_CARRIER = 'de';

const MONTHS = {
    short: ['xan.', 'feb.', 'mar.', 'abr.', 'maio', 'xuño', 'xul.', 'ago.', 'set.', 'out.', 'nov.', 'dec.'],
    long: [
        'xaneiro',
        'febreiro',
        'marzo',
        'abril',
        'maio',
        'xuño',
        'xullo',
        'agosto',
        'setembro',
        'outubro',
        'novembro',
        'decembro',
    ],
};

/** From Sunday, the order of `Date.prototype.getUTCDay`. */
const WEEKDAYS = {
    short: ['dom.', 'luns', 'mar.', 'mér.', 'xov.', 'ven.', 'sáb.'],
    long: ['domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado'],
};

type DateValue = Parameters<IntlShape['formatDate']>[0];
type DateOptions = NonNullable<Parameters<IntlShape['formatDate']>[1]>;
type RelativeTimeUnit = NonNullable<Parameters<IntlShape['formatRelativeTime']>[1]>;
type RelativeTimeOptions = Parameters<IntlShape['formatRelativeTime']>[2];

type Shape = {
    weekday?: 'long' | 'short';
    day?: 'numeric' | '2-digit';
    month?: 'long' | 'short' | 'numeric' | '2-digit';
    year?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
};

const DATE_STYLES: Record<string, Shape> = {
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
};

const TIME_STYLES: Record<string, Shape> = {
    medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    short: { hour: '2-digit', minute: '2-digit' },
};

const ALLOWED: Record<keyof Shape, readonly string[]> = {
    weekday: ['long', 'short'],
    day: ['numeric', '2-digit'],
    month: ['long', 'short', 'numeric', '2-digit'],
    year: ['numeric', '2-digit'],
    hour: ['numeric', '2-digit'],
    minute: ['numeric', '2-digit'],
    second: ['numeric', '2-digit'],
};

const FIELDS = Object.keys(ALLOWED) as Array<keyof Shape>;
const UNDERSTOOD = new Set<string>([...FIELDS, 'dateStyle', 'timeStyle', 'timeZone']);

/**
 * The combinations CLDR has no pattern for, which it answers with a best effort of its own:
 * `2023 (día: 3)` for a day and a year, `09 (segundo: 7)` for an hour and a second, `5` for a lone
 * minute where a minute beside an hour is `05`. Not worth imitating, so not written here.
 */
const isWritable = (shape: Shape): boolean => {
    const loose = [shape.weekday, shape.day, shape.year].filter(Boolean).length;
    if (!shape.month && loose > 1) return false;
    if (shape.minute && !shape.hour) return false;
    if (shape.second && !shape.minute) return false;

    return true;
};

/**
 * The options as a set of fields, or `null` for anything these tables cannot write: an era, a time
 * zone name, a 12-hour clock, a narrow month. `null` sends the caller back to the native formatter.
 */
const toShape = (options: DateOptions): Shape | null => {
    const given = Object.entries(options).filter(([, value]) => value !== undefined);
    if (given.some(([key]) => !UNDERSTOOD.has(key))) return null;

    const shape: Shape = {};
    if (options.dateStyle) Object.assign(shape, DATE_STYLES[options.dateStyle]);
    if (options.timeStyle) {
        const time = TIME_STYLES[options.timeStyle];
        if (!time) return null;
        Object.assign(shape, time);
    }
    for (const field of FIELDS) {
        const value = options[field];
        if (value === undefined) continue;
        if (!ALLOWED[field].includes(value)) return null;
        Object.assign(shape, { [field]: value });
    }

    // What `Intl.DateTimeFormat` does with no field at all.
    if (Object.keys(shape).length === 0) return { day: 'numeric', month: 'numeric', year: 'numeric' };

    return isWritable(shape) ? shape : null;
};

/**
 * The calendar fields of an instant in a time zone. `en-US` is the one locale every engine has, and
 * only its digits are read, so this asks the browser for arithmetic and for no wording.
 */
const readFields = (date: Date, timeZone: string | undefined) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }).formatToParts(date);
    const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    const [year, month, day] = [read('year'), read('month') - 1, read('day')];

    return {
        year,
        month,
        day,
        weekday: new Date(Date.UTC(year, month, day)).getUTCDay(),
        hour: read('hour'),
        minute: read('minute'),
        second: read('second'),
    };
};

const pad = (value: number) => String(value).padStart(2, '0');
const digits = (value: number, style: 'numeric' | '2-digit') => (style === '2-digit' ? pad(value) : String(value));

const writeDate = (shape: Shape, fields: ReturnType<typeof readFields>): string => {
    const day = shape.day && digits(fields.day, shape.day);
    const year = shape.year && (shape.year === '2-digit' ? pad(fields.year % 100) : String(fields.year));
    const weekday = shape.weekday && WEEKDAYS[shape.weekday][fields.weekday];

    const date =
        shape.month === 'numeric' || shape.month === '2-digit'
            ? [day, digits(fields.month + 1, shape.month), year].filter(Boolean).join('/')
            : [day, shape.month && MONTHS[shape.month][fields.month], year].filter(Boolean).join(' de ');

    return [weekday, date].filter(Boolean).join(', ');
};

/**
 * Galician writes a time with two digits in every field whichever width is asked for: `09:05`,
 * never `9:05`.
 */
const writeTime = (shape: Shape, fields: ReturnType<typeof readFields>): string =>
    [shape.hour && fields.hour, shape.minute && fields.minute, shape.second && fields.second]
        .filter((value): value is number => typeof value === 'number')
        .map(pad)
        .join(':');

const toDate = (value: DateValue): Date => (value instanceof Date ? value : new Date(value ?? Date.now()));

/**
 * `hai 6 minutos`, `onte`, `en 3 horas`. With `numeric: 'auto'` the units that have a word of their
 * own use it, as `Intl.RelativeTimeFormat` does.
 */
const RELATIVE: Partial<Record<RelativeTimeUnit, { one: string; other: string; named: Record<number, string> }>> = {
    second: { one: 'segundo', other: 'segundos', named: { 0: 'agora' } },
    minute: { one: 'minuto', other: 'minutos', named: { 0: 'este minuto' } },
    hour: { one: 'hora', other: 'horas', named: { 0: 'esta hora' } },
    day: { one: 'día', other: 'días', named: { [-2]: 'antonte', [-1]: 'onte', 0: 'hoxe', 1: 'mañá', 2: 'pasadomañá' } },
};

export const createGalicianIntl = (config: Omit<IntlConfig, 'locale'>, cache?: IntlCache): IntlShape => {
    const native = createIntl({ ...config, locale: 'gl' }, cache);
    const carrier = createIntl({ ...config, locale: NUMBER_CARRIER }, cache);

    // Same policy as the provider's `onError`: a reader cannot act on this, a developer must see it.
    const report = (method: string, options: unknown) => {
        if (process.env.NODE_ENV === 'production') return;
        console.error(
            `[intl:galician] ${method} cannot write ${JSON.stringify(options)} from its own tables and fell back ` +
                'to the native formatter, which has no Galician data in Chromium. The text will be in the ' +
                "browser's language and will not match the server's. Add the shape to src/intl/galician.ts."
        );
    };

    const format = (method: string, value: DateValue, options: DateOptions, fallback: () => string): string => {
        const shape = toShape(options);
        const date = toDate(value);
        if (!shape || Number.isNaN(date.getTime())) {
            report(method, options);
            return fallback();
        }

        const fields = readFields(date, options.timeZone ?? config.timeZone);
        return [writeDate(shape, fields), writeTime(shape, fields)].filter(Boolean).join(', ');
    };

    const formatDate: IntlShape['formatDate'] = (value, options = {}) =>
        format('formatDate', value, options, () => native.formatDate(value, options));

    const formatTime: IntlShape['formatTime'] = (value, options = {}) => {
        // react-intl's own default: hours and minutes, unless a field or a style was asked for.
        const isSpecific =
            options.hour || options.minute || options.second || options.timeStyle || options.dateStyle;
        const withDefaults: DateOptions = isSpecific ? options : { ...options, hour: 'numeric', minute: 'numeric' };

        return format('formatTime', value, withDefaults, () => native.formatTime(value, options));
    };

    const formatRelativeTime = (value: number, unit: RelativeTimeUnit = 'second', options?: RelativeTimeOptions) => {
        const wording = RELATIVE[unit];
        if (!wording || !Number.isInteger(value) || (options?.style && options.style !== 'long')) {
            report('formatRelativeTime', { value, unit, ...options });
            return native.formatRelativeTime(value, unit, options);
        }

        const named = options?.numeric === 'auto' ? wording.named[value] : undefined;
        if (named) return named;

        const amount = `${carrier.formatNumber(Math.abs(value))} ${Math.abs(value) === 1 ? wording.one : wording.other}`;
        return value < 0 || Object.is(value, -0) ? `hai ${amount}` : `en ${amount}`;
    };

    return {
        ...native,
        formatDate,
        formatTime,
        formatRelativeTime,
        formatNumber: carrier.formatNumber,
        formatNumberToParts: carrier.formatNumberToParts,
        formatPlural: carrier.formatPlural,
        formatMessage: carrier.formatMessage,
        $t: carrier.$t,
    };
};
