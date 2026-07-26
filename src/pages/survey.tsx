import Dialog from '@/components/Dialog';
import styles from '@/styles/survey.module.css';
import ControlButtons from '@/components/ControlButtons';
import Confetti from 'react-confetti';
import SEO from '@/components/SEO';
import useWindowResize from '@/hooks/useWindowResize';
import useSurvey, { type Question } from '@/hooks/useSurvey';
import NavigationArrows from '@/components/NavigationArrows';
import QuestionBlock from '@/components/QuestionBlock';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import surveyCopy from '../intl/survey';
import { useRouter } from 'next/router';

const Survey = () => {
    const { width, height } = useWindowResize();
    const router = useRouter();
    const copy = surveyCopy(router.locale);
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
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <>
            {/*
             * SDD-L06: a full-viewport 100-piece burst with no opt-out. Large-area unexpected motion
             * is the canonical vestibular trigger, and the global prefers-reduced-motion block cannot
             * help here — this is a canvas painting on a timer, not a CSS animation. So it is gated in
             * JS, and the canvas is hidden from assistive tech either way.
             */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={100}
                run={surveySuccess && !prefersReducedMotion}
                aria-hidden="true"
            />
            <SEO
                noimage={false}
                /* SDD-L08: title and description were Spanish literals on a trilingual site,
                   hardcoded here rather than in any catalogue. */
                meta={{
                    title: copy.seo.title,
                    description: copy.seo.description,
                    noindex: true,
                }}
            />
            <Dialog
                open
                modalMode
                withPadding
                header={
                    <div className={styles.header}>
                        {/*
                          * SDD-L08: the window controls did nothing at all — no handler was passed,
                          * so the close button on a modal that covers the whole viewport was inert.
                          * `router.back()` returns to wherever the visitor came from, which for this
                          * page is almost always the blog post that linked here.
                          */}
                        <ControlButtons onClickClose={() => router.back()} onClickMinimise={() => router.back()} />
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
