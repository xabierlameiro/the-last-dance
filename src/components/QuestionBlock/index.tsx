import React from 'react';
import styles from '@/styles/survey.module.css';

export type AnswerOption = {
    answerText: string;
    isCorrect: boolean;
};

export type Question = {
    questionText?: string;
    questionHtml?: string;
    answerOptions?: AnswerOption[];
};

type Props = {
    question: Question;
    index: number;
    currentQuestionNum: number;
    answers: Array<{ answer: string }>;
    handleAnswerOptionClick: (payload: {
        question: string;
        answer: string;
        isCorrect: boolean;
        questionNum: number;
    }) => void;
};

const QuestionBlock = ({
    question,
    index,
    currentQuestionNum,
    answers,
    handleAnswerOptionClick,
}: Props) => {
    if (currentQuestionNum !== index) return null;

    return (
        <div data-testid="question-block" className={styles.question}>
            <div
                // skipcq: JS-0440 - dangerouslySetInnerHTML is safe here as questionHtml is sanitized content
                dangerouslySetInnerHTML={{ __html: question.questionHtml || '' }}
                className={styles.questionHtml}
            />
            {question.answerOptions?.map((answerOption) => (
                <label htmlFor={answerOption.answerText} key={answerOption.answerText}>
                    <input
                        onChange={(e) =>
                            handleAnswerOptionClick({
                                question: question.questionText || '',
                                answer: e.target.value,
                                isCorrect: answerOption.isCorrect,
                                questionNum: index,
                            })
                        }
                        type="radio"
                        id={answerOption.answerText}
                        name={String(index)}
                        value={answerOption.answerText}
                        checked={answers[index]?.answer === answerOption.answerText}
                    />
                    {answerOption.answerText}
                </label>
            ))}
        </div>
    );
};

export default QuestionBlock;
