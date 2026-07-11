import { useRouter } from 'next/router';
import { useMemo, useReducer } from 'react';
import {
    buildSurveyQuestions,
    sanitizeSurveyName,
    DEFAULT_SURVEY_NAME,
    type Question,
} from '@/constants/survey';

interface Answer {
    question: string;
    answer: string;
    isCorrect: boolean;
    questionNum: number;
}

interface SurveyState {
    currentQuestion: number;
    questionsDone: number;
    success: boolean;
    answers: Answer[];
}

type SurveyAction = { type: 'NEXT_QUESTION' } | { type: 'PREVIOUS_QUESTION' } | { type: 'ADD_ANSWER'; payload: Answer };

const initialState: SurveyState = {
    currentQuestion: 0,
    questionsDone: 0,
    success: false,
    answers: [],
};

const reducer = (state: SurveyState, action: SurveyAction): SurveyState => {
    const { questionNum } = 'payload' in action ? action.payload : ({} as Partial<Answer>);
    const { answers, questionsDone, currentQuestion } = state;
    const newAnswers: Answer[] = [...answers];

    switch (action.type) {
        case 'NEXT_QUESTION':
            return {
                ...state,
                currentQuestion: currentQuestion + 1,
            };
        case 'PREVIOUS_QUESTION':
            return {
                ...state,
                currentQuestion: currentQuestion - 1,
            };
        case 'ADD_ANSWER':
            if (questionNum !== undefined) {
                newAnswers[questionNum] = {
                    ...action.payload,
                };
                return {
                    ...state,
                    answers: newAnswers,
                    currentQuestion: currentQuestion + 1,
                    questionsDone: questionNum > questionsDone ? questionNum : questionsDone,
                    success: newAnswers.every((answer) => answer.isCorrect) && currentQuestion === 10,
                };
            }
            return state;
        default:
            return state;
    }
};

const useSurvey = () => {
    const { query } = useRouter();
    const rawName = Array.isArray(query.name) ? query.name[0] : query.name ?? DEFAULT_SURVEY_NAME;
    const name = sanitizeSurveyName(rawName);

    const [state, dispatch] = useReducer(reducer, initialState);

    const questions = useMemo(() => buildSurveyQuestions(name, state.success), [name, state.success]);

    const handlePreviousQuestion = () => {
        if (state.currentQuestion > 1) dispatch({ type: 'PREVIOUS_QUESTION' });
    };

    const handleNextQuestion = () => {
        if (state.currentQuestion !== 0 && state.questionsDone >= state.currentQuestion)
            dispatch({ type: 'NEXT_QUESTION' });
    };

    const handleAnswerOptionClick = (payload: {
        question: string;
        answer: string;
        isCorrect: boolean;
        questionNum: number;
    }) => dispatch({ type: 'ADD_ANSWER', payload });

    return {
        questions,
        answers: state.answers,
        surveySuccess: state.success,
        currentQuestionNum: state.currentQuestion,
        questionsDoneNum: state.questionsDone,
        totalQuestions: questions.length,
        handleAnswerOptionClick,
        handleNextQuestion,
        handlePreviousQuestion,
    };
};

export default useSurvey;
export type { Question };
