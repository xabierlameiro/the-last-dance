import en from './en';
import es from './es';
import gl from './gl';
import type { SurveyCopy } from './types';

/**
 * SDD-L08-T7. The survey's copy, resolved by locale.
 *
 * Three catalogues rather than a locale-keyed record with a cast, so `SurveyCopy` is checked
 * against each one and a translator who drops a key gets a compile error rather than an
 * `undefined` rendered into a heading.
 *
 * Falls back to Spanish, not English: this questionnaire is addressed to recruiters, most of whom
 * reach it from a Spanish-language job market, and Spanish is the language it was written in.
 */
const CATALOGUES: Record<string, SurveyCopy> = { en, es, gl };

const surveyCopy = (locale: string | undefined): SurveyCopy => CATALOGUES[locale ?? ''] ?? es;

export default surveyCopy;
export type { SurveyCopy };
