import QuestionBlock, { Question } from '..';
import { fireEvent, render, screen } from '@/test';

describe('QuestionBlock component', () => {
    const question: Question = {
        questionText: 'Sample question',
        questionHtml: '<h1>Sample question?</h1>',
        answerOptions: [
            { answerText: 'Yes', isCorrect: true },
            { answerText: 'No', isCorrect: false },
        ],
    };

    it('Should render question and answers when active', () => {
        render(
            <QuestionBlock
                question={question}
                index={0}
                currentQuestionNum={0}
                answers={[]}
                handleAnswerOptionClick={jest.fn()}
            />
        );
        expect(screen.getByTestId('question-block')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('Should call handler when option selected', () => {
        const handler = jest.fn();
        render(
            <QuestionBlock
                question={question}
                index={0}
                currentQuestionNum={0}
                answers={[]}
                handleAnswerOptionClick={handler}
            />
        );
        fireEvent.click(screen.getByLabelText('Yes'));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('Should not render when not active', () => {
        render(
            <QuestionBlock
                question={question}
                index={1}
                currentQuestionNum={0}
                answers={[]}
                handleAnswerOptionClick={jest.fn()}
            />
        );
        expect(screen.queryByTestId('question-block')).not.toBeInTheDocument();
    });
});
