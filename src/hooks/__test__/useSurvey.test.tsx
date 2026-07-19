import { renderHook, act } from '@testing-library/react';
import useSurvey from '../useSurvey';

jest.mock('next/router', () => ({
    useRouter: () => ({ query: { name: 'Ana' } }),
}));

const answer = (questionNum: number, isCorrect: boolean) => ({
    question: `Q${questionNum}`,
    answer: 'A',
    isCorrect,
    questionNum,
});

describe('useSurvey', () => {
    it('starts on the first question with nothing answered', () => {
        const { result } = renderHook(() => useSurvey());

        expect(result.current.currentQuestionNum).toBe(0);
        expect(result.current.questionsDoneNum).toBe(0);
        expect(result.current.answers).toEqual([]);
        expect(result.current.surveySuccess).toBe(false);
    });

    it('advances the current question when an answer is recorded', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, true)));

        expect(result.current.currentQuestionNum).toBe(1);
        expect(result.current.answers[0]).toMatchObject({ questionNum: 0, isCorrect: true });
    });

    it('overwrites the stored answer when the same question is answered again', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, true)));
        act(() => result.current.handleAnswerOptionClick(answer(0, false)));

        expect(result.current.answers).toHaveLength(1);
        expect(result.current.answers[0].isCorrect).toBe(false);
    });

    // questionsDone tracks the furthest question reached, so going back must not rewind it
    it('keeps questionsDone at the high-water mark', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, true)));
        act(() => result.current.handleAnswerOptionClick(answer(1, true)));
        act(() => result.current.handleAnswerOptionClick(answer(2, true)));
        const reached = result.current.questionsDoneNum;

        act(() => result.current.handleAnswerOptionClick(answer(1, true)));

        expect(result.current.questionsDoneNum).toBe(reached);
    });

    it('ignores a previous-question request while on the first two questions', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handlePreviousQuestion());

        expect(result.current.currentQuestionNum).toBe(0);
    });

    it('steps back once past the first question', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, true)));
        act(() => result.current.handleAnswerOptionClick(answer(1, true)));
        act(() => result.current.handlePreviousQuestion());

        expect(result.current.currentQuestionNum).toBe(1);
    });

    // Forward navigation is only allowed onto ground already covered
    it('refuses to skip ahead of the furthest answered question', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, true)));
        const before = result.current.currentQuestionNum;

        act(() => result.current.handleNextQuestion());

        expect(result.current.currentQuestionNum).toBe(before);
    });

    it('never reports success while an answer is wrong', () => {
        const { result } = renderHook(() => useSurvey());

        act(() => result.current.handleAnswerOptionClick(answer(0, false)));

        expect(result.current.surveySuccess).toBe(false);
    });
});
