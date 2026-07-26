import { messages } from '../translations';
import en from '../messages/en';

const LOCALES = ['en', 'es', 'gl'] as const;

/**
 * SDD-L08. The catalogue itself was never the problem — it was 75/75/75 keys with no gaps. What let
 * everything else in this phase accumulate was `_app.tsx`'s `onError`, an `if` with an empty body
 * and nothing outside it, which discarded every `MISSING_TRANSLATION` react-intl ever raised.
 *
 * These tests are the part of that guarantee that does not depend on someone reading a console.
 */
describe('message catalogues', () => {
    it.each(LOCALES)('%s declares exactly the same keys as en', (locale) => {
        expect(Object.keys(messages[locale]).sort()).toEqual(Object.keys(en).sort());
    });

    it.each(LOCALES)('%s leaves no message empty', (locale) => {
        const empty = Object.entries(messages[locale]).filter(([, value]) => value.trim() === '');
        expect(empty).toEqual([]);
    });

    /**
     * `{readTime} minutes of reading time` with `Math.ceil(words / 200)` reads "1 minutes" on any
     * post under 200 words. Galician's plural categories are `one`/`other`, the same as Spanish and
     * English — verified with `Intl.PluralRules`, not assumed from their similarity.
     */
    it.each(LOCALES)('%s pluralises the counters that can legitimately be 1', (locale) => {
        expect(messages[locale]['blog.readtime']).toContain('plural');
        expect(messages[locale]['indexedCounter.tooltip']).toContain('plural');
    });

    // 'minus' and 'segus' are not words in Spanish or Galician; English mixed 'mons' and a singular
    // 'hour' in among full plurals.
    it.each(LOCALES)('%s spells the countdown units as real words', (locale) => {
        const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'].map(
            (unit) => messages[locale][`countdown.${unit}` as keyof typeof en]
        );

        expect(units).not.toContain('minus');
        expect(units).not.toContain('segus');
        expect(units).not.toContain('mons');
        expect(units).not.toContain('hour');
    });

    it.each(LOCALES)('%s has no misspelled percentage placeholder', (locale) => {
        expect(JSON.stringify(messages[locale])).not.toContain('Porcentage');
        expect(messages[locale]['cryptoPrice.tooltip']).toContain('{todayPercentage}');
    });

    // 'blog.title' was placeholder copy ("This is the blog page"); 'background.image.alt' was read
    // aloud as the first content of every page. Both are gone, and a reintroduction is a defect.
    it.each(LOCALES)('%s carries no dead or placeholder keys', (locale) => {
        expect(messages[locale]).not.toHaveProperty('blog.title');
        expect(messages[locale]).not.toHaveProperty('blog.readHits');
        expect(messages[locale]).not.toHaveProperty('background.image.alt');
    });
});
