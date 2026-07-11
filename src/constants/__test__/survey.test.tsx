import { render, screen } from '@/test';
import { buildSurveyQuestions, sanitizeSurveyName, DEFAULT_SURVEY_NAME } from '../survey';

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
        const questions = buildSurveyQuestions('xabier', false);
        expect(questions).toHaveLength(12);
        render(<>{questions[0].questionContent}</>);
        expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Xabier');
    });

    it('never executes markup coming from the name', () => {
        const payload = sanitizeSurveyName('<img src=x onerror="alert(1)">');
        const questions = buildSurveyQuestions(payload, false);
        render(<>{questions[0].questionContent}</>);
        expect(document.querySelector('img')).toBeNull();
    });

    it('shows the success content only on success', () => {
        const success = buildSurveyQuestions('xabier', true);
        render(<>{success[11].questionContent}</>);
        expect(screen.getByText(/Somos compatibles/)).toBeInTheDocument();
    });
});
