import { render, screen } from '@/test';
import { buildSurveyQuestions, sanitizeSurveyName, DEFAULT_SURVEY_NAME } from '../survey';
import surveyCopy from '../../intl/survey';
import en from '../../intl/survey/en';
import es from '../../intl/survey/es';
import gl from '../../intl/survey/gl';

describe('sanitizeSurveyName', () => {
    it('accepts plain names, including accents and hyphens', () => {
        expect(sanitizeSurveyName('xabier')).toBe('xabier');
        expect(sanitizeSurveyName('José-María')).toBe('José-María');
        expect(sanitizeSurveyName("O'Neil")).toBe("O'Neil");
    });

    it('rejects markup, entities and oversized input', () => {
        expect(sanitizeSurveyName('<img src=x onerror="alert(1)">')).toBe(DEFAULT_SURVEY_NAME);
        expect(sanitizeSurveyName('<script>alert(1)</script>')).toBe(DEFAULT_SURVEY_NAME);
        expect(sanitizeSurveyName('&#128075;')).toBe(DEFAULT_SURVEY_NAME);
        expect(sanitizeSurveyName('a'.repeat(41))).toBe(DEFAULT_SURVEY_NAME);
        expect(sanitizeSurveyName('')).toBe(DEFAULT_SURVEY_NAME);
    });
});

describe('buildSurveyQuestions', () => {
    it('builds the full questionnaire with the greeting capitalized', () => {
        const questions = buildSurveyQuestions('xabier', false, es);
        expect(questions).toHaveLength(12);
        render(<>{questions[0].questionContent}</>);
        expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Xabier');
    });

    it('never executes markup coming from the name', () => {
        const payload = sanitizeSurveyName('<img src=x onerror="alert(1)">');
        const questions = buildSurveyQuestions(payload, false, es);
        render(<>{questions[0].questionContent}</>);
        expect(document.querySelector('img')).toBeNull();
    });

    it('shows the success content only on success', () => {
        const success = buildSurveyQuestions('xabier', true, es);
        render(<>{success[11].questionContent}</>);
        expect(screen.getByText(/Somos compatibles/)).toBeInTheDocument();
    });
});

/**
 * SDD-L08-T7. Every question prompt, every answer option and both result screens were Spanish string
 * literals on a site that ships in three languages — and because none of it went through react-intl,
 * nothing ever reported them as missing. There was no message id to miss.
 */
describe('survey copy', () => {
    it.each([
        ['en', en],
        ['es', es],
        ['gl', gl],
    ])('renders the questionnaire in %s', (locale, copy) => {
        const questions = buildSurveyQuestions('xabier', false, copy);

        expect(questions).toHaveLength(12);
        render(<>{questions[1].questionContent}</>);
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(copy.questions[0].heading);
    });

    it('resolves copy by locale and falls back to Spanish', () => {
        expect(surveyCopy('en')).toBe(en);
        expect(surveyCopy('gl')).toBe(gl);
        // The questionnaire is addressed to recruiters in a Spanish-language market, and Spanish is
        // the language it was written in — so an unknown locale gets Spanish, not English.
        expect(surveyCopy(undefined)).toBe(es);
        expect(surveyCopy('fr')).toBe(es);
    });

    /**
     * The point of splitting copy from logic: translating a question must not be able to change
     * which answers count as a match. The correctness flags live in `constants/survey.tsx` and the
     * three catalogues supply only wording, so all three must produce identical outcomes.
     */
    it('gives every locale the same answer key', () => {
        const flagsFor = (copy: typeof es) =>
            buildSurveyQuestions('x', false, copy).map((question) =>
                (question.answerOptions ?? []).map((option) => option.isCorrect)
            );

        expect(flagsFor(en)).toEqual(flagsFor(es));
        expect(flagsFor(gl)).toEqual(flagsFor(es));
    });

    it('gives every locale the same number of options per question', () => {
        for (const copy of [en, es, gl]) {
            expect(copy.questions).toHaveLength(es.questions.length);
            for (const question of copy.questions) expect(question.options).toHaveLength(3);
        }
    });
});
