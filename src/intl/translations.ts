import en from './messages/en';
import es from './messages/es';
import gl from './messages/gl';

/**
 * SDD-L08/L09. The three catalogues used to be one 300-line literal in this file. They are now one
 * module each under `./messages/`, which is the seam L09-T9 needs to load only the active locale
 * and what made the survey copy pass tractable.
 *
 * This module keeps the shape every importer already uses, so the split is invisible to callers.
 *
 * The keys are declared identical across locales rather than by convention: `Messages` is derived
 * from `en`, so a key added to one catalogue and forgotten in another is a compile error instead of
 * a silent fallback to the id. That guarantee is the whole reason this phase exists — the previous
 * `onError` handler discarded every `MISSING_TRANSLATION` before anyone could see it.
 */
export type Messages = Record<keyof typeof en, string>;

export const messages: Record<'en' | 'es' | 'gl', Messages> = { en, es, gl };
