'use client'

import Dialog from '@/components/Dialog'
import styles from '@/styles/survey.module.css'
import ControlButtons from '@/components/ControlButtons'
import Confetti from 'react-confetti'
import useWindowResize from '@/hooks/useWindowResize'
import useSurvey from '@/hooks/useSurvey'
import NavigationArrows from '@/components/NavigationArrows'
import QuestionBlock from '@/components/QuestionBlock'
import Image from 'next/image'

interface SurveyContentProps {
  dictionary: any
}

export default function SurveyContent({ dictionary }: SurveyContentProps) {
  const { width, height } = useWindowResize()
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
  } = useSurvey()

  return (
    <>
      <Confetti width={width} height={height} numberOfPieces={100} run={surveySuccess} />
      <Dialog
        modalMode
        className="survey"
        open
        header={
          <div className={styles.header}>
            <ControlButtons />
            <div>Survey {questionsDoneNum}/{totalQuestions}</div>
          </div>
        }
        body={
          surveySuccess ? (
            <div className={styles.success}>
              <Image src="/survey-success.png" alt="Survey completed" width={200} height={200} />
              <h2>{dictionary?.survey?.success?.title ?? 'Thank you!'}</h2>
              <p>{dictionary?.survey?.success?.message ?? 'Your feedback is valuable to us.'}</p>
            </div>
          ) : (
            <div className={styles.questionContainer}>
              <QuestionBlock
                question={questions[currentQuestionNum]}
                answers={answers}
                handleAnswerOptionClick={handleAnswerOptionClick}
              />
              <NavigationArrows
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                showNext={currentQuestionNum < totalQuestions - 1}
                showPrevious={currentQuestionNum > 0}
              />
            </div>
          )
        }
      />
    </>
  )
}
