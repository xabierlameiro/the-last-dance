import Dialog from '@/components/Dialog';
import styles from '@/styles/survey.module.css';
import ControlButtons from '@/components/ControlButtons';
import Confetti from 'react-confetti';
import SEO from '@/components/SEO';
import useWindowResize from '@/hooks/useWindowResize';
import useSurvey, { type Question } from '@/hooks/useSurvey';
import NavigationArrows from '@/components/NavigationArrows';
import QuestionBlock from '@/components/QuestionBlock';

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
                    <div className={styles.container}>
                        {questions.map((question: Question, index: number) => (
                            <QuestionBlock
                                key={index}
                                question={question}
                                index={index}
                                currentQuestionNum={currentQuestionNum}
                                answers={answers}
                                handleAnswerOptionClick={handleAnswerOptionClick}
                            />
                        ))}
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
