import Dialog from '@/components/Dialog';
import styles from '@/styles/survey.module.css';
import ControlButtons from '@/components/ControlButtons';
import Confetti from 'react-confetti';
import SEO from '@/components/SEO';
import useWindowResize from '@/hooks/useWidowResize';
import useSurvey from '@/hooks/useSurvey';
import NavigationArrows from '@/components/NavigationArrows';

const Survey = () => {
    const { width, height } = useWindowResize();
    const {
        questions,
        answers,
        surveySuccess,
        totalQuestions,
        currentQuestionNum,
        questionsDoneNum,
        handleNextQuestion,
        handlePreviousQuestion,
        handleAnswerOptionClick,
    } = useSurvey();

    return (
        <>
            <Confetti width={width} height={height} numberOfPieces={100} run={surveySuccess} />
            <SEO
                noimage={false}
                meta={{
                    title: 'Averigua si hago match con la posición en 1 minuto',
                    description: 'Click para continuar',
                    noindex: true,
                }}
            />
            <Dialog
                open
                modalMode
                withPadding
                header={
                    <div className={styles.header}>
                        <ControlButtons />
                        <span>
                            {currentQuestionNum > 0 && currentQuestionNum < 11 && (
                                <span>
                                    {currentQuestionNum} / {totalQuestions - 2}
                                </span>
                            )}
                        </span>
                    </div>
                }
                body={
                    // TODO: Move to a component
                    <div className={styles.container}>
                        {questions.map(
                            (question: any, index: number) =>
                                currentQuestionNum === index && (
                                    <div key={index} className={styles.question}>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: question.questionHtml }}
                                            className={styles.questionHtml}
                                        />
                                        {question.answerOptions?.map((answerOption: any) => (
                                            <label htmlFor={answerOption.answerText} key={answerOption.answerText}>
                                                <input
                                                    onChange={(e) =>
                                                        handleAnswerOptionClick({
                                                            question: question.questionText,
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
                                )
                        )}
                    </div>
                }
                footer={
                    <div className={styles.buttons}>
                        <NavigationArrows
                            hidden={currentQuestionNum < 1 || currentQuestionNum > 10}
                            disabledLeft={currentQuestionNum < 2}
                            disabledRight={questionsDoneNum < currentQuestionNum}
                            onClickLeft={handlePreviousQuestion}
                            onClickRight={handleNextQuestion}
                        />
                    </div>
                }
            />
        </>
    );
};

export default Survey;
