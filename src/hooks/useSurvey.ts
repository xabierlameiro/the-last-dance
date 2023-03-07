import { useRouter } from 'next/router';
import { useReducer, useEffect, useRef } from 'react';

const initialState = {
    currentQuestion: 0,
    questionsDone: 0,
    success: false,
    answers: [],
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'NEXT_QUESTION':
            return {
                ...state,
                currentQuestion: state.currentQuestion + 1,
            };
        case 'PREVIOUS_QUESTION':
            return {
                ...state,
                currentQuestion: state.currentQuestion - 1,
            };
        case 'ADD_ANSWER':
            const { questionNum } = action.payload;
            const { answers } = state;
            const newAnswers = [...answers];
            newAnswers[questionNum] = {
                ...action.payload,
            };
            return {
                ...state,
                answers: newAnswers,
                currentQuestion: state.currentQuestion + 1,
                questionsDone: questionNum > state.questionsDone ? questionNum : state.questionsDone,
                success: newAnswers.every((answer) => answer.isCorrect) && state.currentQuestion === 10,
            };
        default:
            return state;
    }
};

const useSurvey = () => {
    const { query } = useRouter();
    const { name = '&#128075;' } = query;
    const emailRef = useRef<boolean>(false);

    const [state, dispatch] = useReducer(reducer, initialState);

    const questions = [
        {
            questionText: '¿ Continuamos ?',
            questionHtml: `
                    <h1>Hola ${
                        (name as any).charAt(0).toUpperCase() + name.slice(1)
                    }, gracias por ponerte en contanto!</h1>
                    <p>
                        Si has llegado hasta aquí, seguro que es por que tienes una posición increíble y me lo
                        quieres contar!! Pero antes de conocernos y que me hagas muchas preguntas, a mi también me
                        gustaría verificar algunas cosas primero, para saber si la posición y yo, somos compatibles.
                    </p> 
                    <p>
                        Si lo somos... te mostraré mi <strong>número de teléfono</strong>, 
                        <strong>disponibilidad</strong>, <strong>currículum actualizado</strong> y
                        muchas cosas más.
                    </p>
                    <h2>¿ Te apuntas ?</h2>
                `,
            answerOptions: [{ answerText: 'Si', isCorrect: true }],
        },

        {
            questionText: 'Tipo de posición:',
            questionHtml: '<h1>La posición es para un perfil :</h1>',
            answerOptions: [
                { answerText: 'Frontend', isCorrect: true },
                { answerText: 'Backend', isCorrect: false },
                { answerText: 'Fullstack', isCorrect: false },
            ],
        },
        {
            questionText: 'Tipo de contrato:',
            questionHtml: '<h1>El contrato será :</h1>',
            answerOptions: [
                { answerText: 'Remoto 100% pero solo en España', isCorrect: true },
                { answerText: 'Remoto 100% en todo el mundo', isCorrect: true },
                { answerText: 'Ninguna de las dos', isCorrect: false },
            ],
        },
        {
            questionText: 'Rango salarial:',
            questionHtml: '<h1>El rango salarial es :</h1>',
            answerOptions: [
                { answerText: 'Menor o igual a 49.000€', isCorrect: false },
                { answerText: 'Entre 50.000€ y 59.000€', isCorrect: true },
                { answerText: 'Mayor o igual a 60.000€', isCorrect: true },
            ],
        },
        {
            questionText: 'Tipo de equipo:',
            questionHtml: '<h1>El equipo de trabajo será :</h1>',
            answerOptions: [
                { answerText: 'Nacional', isCorrect: true },
                { answerText: 'Internacional', isCorrect: true },
                { answerText: 'Lo desconozco', isCorrect: true },
            ],
        },
        {
            questionText: 'Salario variable:',
            questionHtml: '<h1>¿ El salario tendrá una parte variable ?</h1>',
            answerOptions: [
                { answerText: 'Si', isCorrect: false },
                { answerText: 'No', isCorrect: true },
                { answerText: 'Lo desconozco', isCorrect: true },
            ],
        },
        {
            questionText: 'Días de vacaciones:',
            questionHtml: '<h1>Los días de vacaciones son :</h1>',
            answerOptions: [
                { answerText: '22 - 23', isCorrect: false },
                { answerText: '24 - 26', isCorrect: true },
                { answerText: '27 o más', isCorrect: true },
            ],
        },
        {
            questionText: 'Horario de trabajo:',
            questionHtml: '<h1>¿ El horario de trabajo es flexible ?</h1>',
            answerOptions: [
                { answerText: 'Si, pero con peros.', isCorrect: false },
                { answerText: 'Si, totalmente.', isCorrect: true },
                { answerText: 'No', isCorrect: false },
            ],
        },
        {
            questionText: 'Tipo de equipo:',
            questionHtml: '<h1>El equipo de trabajo será :',
            answerOptions: [
                { answerText: 'Windows', isCorrect: false },
                { answerText: 'Mac/Linux', isCorrect: true },
                { answerText: 'A escoger', isCorrect: true },
            ],
        },
        {
            questionText: 'Promedio de antigüedad:',
            questionHtml: '<h1>La media de antigüedad de los compañeros es de :</h1>',
            answerOptions: [
                { answerText: 'Menos de 1 año', isCorrect: false },
                { answerText: 'Menos de 2 años', isCorrect: true },
                { answerText: 'Más de 2 años', isCorrect: true },
            ],
        },
        {
            questionText: 'Proceso de selección:',
            questionHtml: '<h1>El proceso de selección consta de :</h1>',
            answerOptions: [
                { answerText: 'Entrevistas', isCorrect: true },
                { answerText: 'Entrevistas y prueba técnica larga', isCorrect: true },
                { answerText: 'Entrevistas y prueba técnica corta', isCorrect: true },
            ],
        },
        {
            questionHtml: `
                <section>
                    ${
                        state.success
                            ? `
                        <h1>¡¡¡ OMG !!! Somos compatibles</h1>
                        <img src="/celebration.gif" alt="celebration" width="100%" />
                        <h2> ¿ Quieres contarme más ? <a href="tel:+34603018268'" >603018268</a> </h2>
                        <table>
                            <tr>
                                <td> Lunes </td>
                                <td> 10:00 - 14:15 </td>
                                <td> 17:45 - 21:00 </td>
                             
                            </tr>
                            <tr>
                                <td> Martes </td>
                                <td> 10:00 - 14:15 </td>
                                <td> 17:45 - 21:00 </td>
                            </tr>
                            <tr>
                                <td> Miércoles </td>
                                <td> 10:00 - 14:15 </td>
                                <td> 17:45 - 21:00 </td>
                            </tr>
                            <tr>
                                <td> Jueves </td>
                                <td> 10:00 - 14:15 </td>
                                <td> 17:45 - 21:00 </td>
                            </tr>
                            <tr>
                                <td> Viernes </td>
                                <td> 10:00 - 14:15 </td>
                            </tr>
                        </table>
                        <ul>
                            <li> Escríbeme a <a href="mailto:xabier.lameiro@gmail.cm" target="_blank">xabier.lameiro@gmail.com</a></li>
                            <li> Enlace a mi <a href="https://github.com/xabierlameiro" target="_blank"> github </a></li>
                            <li> Enlace a mi <a href="https://www.linkedin.com/in/xlameiro/" target="_blank"> linkedin </a></li>
                            <li> Descárgate mi  <a href="/xabierlameiro.com.pdf" download> currículum </a></li>
                        </ul>`
                            : `
                        <h1> Lo siento mucho ${name} </h1>
                        <img src="/disappointed.gif" alt="celebration" width="100%" />
                        <p> Pero parece que la posición y yo no somos compatibles en estos momentos! </p>
                        <p> Te agradezco mucho tu tiempo y espero que encuentres lo que buscas muy pronto. </p>
                        <p> Un saludo. Xabier! &#128075; </p>
                    `
                    }
                </section>`,
        },
    ];

    useEffect(() => {
        if (state.currentQuestion === questions.length - 1 && !emailRef.current) {
            (async () => {
                try {
                    await fetch('/api/email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subject: `Job survey from ${name} - ${new Date().toLocaleString()}`,
                            message: `
                                    <h1> ${name} </h1>
                                    <code> ${navigator.userAgent} </code>
                                    <ol> 
                                        ${state.answers.map(
                                            (answer: any) =>
                                                `<li> ${answer.question} : ${answer.answer} - ${
                                                    answer.isCorrect ? '✅' : '🚫'
                                                } </li>`
                                        )}
                                    </ol>
                                    `.replace(/,/g, ''),
                        }),
                    });
                    emailRef.current = true;
                } catch (e) {
                    console.log(e);
                }
            })();
        }
    }, [state, name, questions.length]);

    const handlePreviousQuestion = () => {
        if (state.currentQuestion > 1) dispatch({ type: 'PREVIOUS_QUESTION' });
    };

    const handleNextQuestion = () => {
        if (state.currentQuestion != 0 && state.questionsDone >= state.currentQuestion)
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
