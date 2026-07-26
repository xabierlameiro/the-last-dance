import QuestionBlock from '..';
import type { Question } from '@/constants/survey';
import { fireEvent, render, screen } from '@/test';

describe('QuestionBlock component', () => {
    const question: Question = {
        questionText: 'Sample question',
        questionContent: <h1>Sample question?</h1>,
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

    /**
     * SDD-L06. The question was a bare <div> beside the options rather than labelling them, so a
     * screen reader announced "Yes, radio button, 1 of 2" with no idea what was being asked.
     */
    it('Should group the options under the question as a radiogroup', () => {
        render(
            <QuestionBlock
                question={question}
                index={0}
                currentQuestionNum={0}
                answers={[]}
                handleAnswerOptionClick={jest.fn()}
            />
        );

        expect(screen.getByRole('group', { name: /Sample question/ })).toBeInTheDocument();
        for (const radio of screen.getAllByRole('radio')) {
            expect(radio).toHaveAccessibleName();
        }
    });

    /**
     * id/htmlFor used to be the answer text itself. That text contains spaces, which is invalid in an
     * id, and it repeats across questions — 'Si' appears in two, 'Lo desconozco' in three. htmlFor
     * resolves to the FIRST matching id in the document, so clicking a label could toggle another
     * question's radio. Rendering two blocks with the same answer texts pins that.
     */
    it('Should give every option a unique, whitespace-free id across questions', () => {
        render(
            <>
                <QuestionBlock
                    question={question}
                    index={0}
                    currentQuestionNum={0}
                    answers={[]}
                    handleAnswerOptionClick={jest.fn()}
                />
                <QuestionBlock
                    question={question}
                    index={1}
                    currentQuestionNum={1}
                    answers={[]}
                    handleAnswerOptionClick={jest.fn()}
                />
            </>
        );

        const ids = screen.getAllByRole('radio').map((radio) => radio.id);

        expect(ids).toHaveLength(4);
        expect(new Set(ids).size).toBe(4);
        for (const id of ids) expect(id).not.toMatch(/\s/);
    });

    it('Should route a label click to its own question, not the first matching id', () => {
        const first = jest.fn();
        const second = jest.fn();
        render(
            <>
                <QuestionBlock
                    question={question}
                    index={0}
                    currentQuestionNum={0}
                    answers={[]}
                    handleAnswerOptionClick={first}
                />
                <QuestionBlock
                    question={question}
                    index={1}
                    currentQuestionNum={1}
                    answers={[]}
                    handleAnswerOptionClick={second}
                />
            </>
        );

        // The SECOND block's "Yes" — under the old scheme both labels pointed at the same id.
        fireEvent.click(screen.getAllByLabelText('Yes')[1]);

        expect(second).toHaveBeenCalledTimes(1);
        expect(first).not.toHaveBeenCalled();
    });

    it('Should render string content as inert text, never as HTML', () => {
        const payload = '<img src=x onerror="alert(1)">';
        render(
            <QuestionBlock
                question={{ questionContent: payload }}
                index={0}
                currentQuestionNum={0}
                answers={[]}
                handleAnswerOptionClick={jest.fn()}
            />
        );
        expect(screen.getByText(payload)).toBeInTheDocument();
        expect(document.querySelector('img')).toBeNull();
    });
});
