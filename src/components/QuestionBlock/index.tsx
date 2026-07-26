import React from 'react';
import styles from '@/styles/survey.module.css';
import type { Question } from '@/constants/survey';

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

const QuestionBlock = ({ question, index, currentQuestionNum, answers, handleAnswerOptionClick }: Props) => {
    if (currentQuestionNum !== index) return null;

    /**
     * SDD-L06. Two defects here, both invisible to a sighted mouse user.
     *
     * The question was a bare `<div>` sitting beside the options rather than labelling them, so a
     * screen reader announced "Frontend, radio button, 1 of 3" with no indication of what was being
     * asked. `<fieldset>` + `<legend>` is the native way to say "these options answer this question".
     *
     * And `id`/`htmlFor` were the answer text itself. That text contains spaces
     * ("Remoto 100% pero solo en España"), which is invalid in an id, and it repeats across
     * questions — 'Si' appears in two, 'Lo desconozco' in three. `htmlFor` resolves to the *first*
     * matching id in the document, so clicking a label could toggle another question's radio. The id
     * is now derived from the question and option indices, which are unique by construction.
     */
    return (
        <fieldset data-testid="question-block" className={styles.question}>
            <legend>{question.questionContent}</legend>
            {question.answerOptions?.map((answerOption, optionIndex) => {
                const optionId = `q${index}-a${optionIndex}`;
                return (
                    <label htmlFor={optionId} key={optionId}>
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
                            id={optionId}
                            name={String(index)}
                            value={answerOption.answerText}
                            checked={answers[index]?.answer === answerOption.answerText}
                        />
                        {answerOption.answerText}
                    </label>
                );
            })}
        </fieldset>
    );
};

export default QuestionBlock;
