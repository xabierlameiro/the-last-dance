import React from 'react';

export type AnswerOption = {
    answerText: string;
    isCorrect: boolean;
};

export type Question = {
    questionText?: string;
    questionContent?: React.ReactNode;
    answerOptions?: AnswerOption[];
};

// Letters (any language), marks, spaces, apostrophes and hyphens only — anything
// else (markup, entities, emoji) falls back to the wave so query params can
// never inject content into the survey.
const NAME_PATTERN = /^[\p{L}\p{M}\s'-]{1,40}$/u;

export const DEFAULT_SURVEY_NAME = '👋';

export const sanitizeSurveyName = (raw: string): string => (NAME_PATTERN.test(raw) ? raw : DEFAULT_SURVEY_NAME);

const SCHEDULE: Array<{ day: string; hours: string[] }> = [
    { day: 'Lunes', hours: ['10:00 - 14:15', '17:45 - 21:00'] },
    { day: 'Martes', hours: ['10:00 - 14:15', '17:45 - 21:00'] },
    { day: 'Miércoles', hours: ['10:00 - 14:15', '17:45 - 21:00'] },
    { day: 'Jueves', hours: ['10:00 - 14:15', '17:45 - 21:00'] },
    { day: 'Viernes', hours: ['10:00 - 14:15'] },
];

const SuccessResult = () => (
    <>
        <h1>¡¡¡ OMG !!! Somos compatibles</h1>
        <img src="/celebration.gif" alt="celebration" width="100%" />
        <h2>
            ¿ Quieres contarme más ? <a href="tel:+34603018268">603018268</a>
        </h2>
        <table>
            <tbody>
                {SCHEDULE.map(({ day, hours }) => (
                    <tr key={day}>
                        <td> {day} </td>
                        {hours.map((hour) => (
                            <td key={hour}> {hour} </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        <ul>
            <li>
                Escríbeme a{' '}
                <a href="mailto:xabier.lameiro@gmail.com" target="_blank" rel="noopener noreferrer">
                    xabier.lameiro@gmail.com
                </a>
            </li>
            <li>
                Enlace a mi{' '}
                <a href="https://github.com/xabierlameiro" target="_blank" rel="noopener noreferrer">
                    github
                </a>
            </li>
            <li>
                Enlace a mi{' '}
                <a href="https://www.linkedin.com/in/xlameiro/" target="_blank" rel="noopener noreferrer">
                    linkedin
                </a>
            </li>
            <li>
                Descárgate mi{' '}
                <a href="/xabierlameiro.com.pdf" download>
                    currículum
                </a>
            </li>
        </ul>
    </>
);

const FailureResult = ({ name }: { name: string }) => (
    <>
        <h1> Lo siento mucho {name} </h1>
        <img src="/disappointed.gif" alt="disappointed" width="100%" />
        <p> Pero parece que la posición y yo no somos compatibles en estos momentos! </p>
        <p> Te agradezco mucho tu tiempo y espero que encuentres lo que buscas muy pronto. </p>
        <p> Un saludo. Xabier! 👋 </p>
    </>
);

export const buildSurveyQuestions = (name: string, success: boolean): Question[] => {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return [
        {
            questionText: '¿ Continuamos ?',
            questionContent: (
                <>
                    <h1>Hola {displayName}, gracias por ponerte en contacto!</h1>
                    <p>
                        Si has llegado hasta aquí, seguro que es porque tienes una posición increíble y me lo quieres
                        contar!! Pero antes de conocernos y que me hagas muchas preguntas, a mi también me gustaría
                        verificar algunas cosas primero, para saber si la posición y yo, somos compatibles.
                    </p>
                    <p>
                        Si lo somos... te mostraré mi <strong>número de teléfono</strong>,{' '}
                        <strong>disponibilidad</strong>, <strong>currículum actualizado</strong> y muchas cosas más.
                    </p>
                    <h2>¿ Te apuntas ?</h2>
                </>
            ),
            answerOptions: [{ answerText: 'Si', isCorrect: true }],
        },
        {
            questionText: 'Tipo de posición:',
            questionContent: <h1>La posición es para un perfil :</h1>,
            answerOptions: [
                { answerText: 'Frontend', isCorrect: true },
                { answerText: 'Backend', isCorrect: false },
                { answerText: 'Fullstack', isCorrect: false },
            ],
        },
        {
            questionText: 'Tipo de contrato:',
            questionContent: <h1>El contrato será :</h1>,
            answerOptions: [
                { answerText: 'Remoto 100% pero solo en España', isCorrect: true },
                { answerText: 'Remoto 100% en todo el mundo', isCorrect: true },
                { answerText: 'Ninguna de las dos', isCorrect: false },
            ],
        },
        {
            questionText: 'Rango salarial:',
            questionContent: <h1>El rango salarial es :</h1>,
            answerOptions: [
                { answerText: 'Menor o igual a 59.000€', isCorrect: false },
                { answerText: 'Entre 60.000€ y 69.000€', isCorrect: true },
                { answerText: 'Mayor o igual a 70.000€', isCorrect: true },
            ],
        },
        {
            questionText: 'Tipo de equipo:',
            questionContent: <h1>El equipo de trabajo será :</h1>,
            answerOptions: [
                { answerText: 'Nacional', isCorrect: true },
                { answerText: 'Internacional', isCorrect: true },
                { answerText: 'Lo desconozco', isCorrect: true },
            ],
        },
        {
            questionText: 'Salario variable:',
            questionContent: <h1>¿ El salario tendrá una parte variable ?</h1>,
            answerOptions: [
                { answerText: 'Si', isCorrect: false },
                { answerText: 'No', isCorrect: true },
                { answerText: 'Lo desconozco', isCorrect: true },
            ],
        },
        {
            questionText: 'Días de vacaciones:',
            questionContent: <h1>Los días de vacaciones son :</h1>,
            answerOptions: [
                { answerText: '22 - 23', isCorrect: true },
                { answerText: '24 - 26', isCorrect: true },
                { answerText: '27 o más', isCorrect: true },
            ],
        },
        {
            questionText: 'Horario de trabajo flexible:',
            questionContent: <h1>¿ El horario de trabajo es flexible ?</h1>,
            answerOptions: [
                { answerText: 'Si, pero con peros.', isCorrect: true },
                { answerText: 'Si, totalmente.', isCorrect: true },
                { answerText: 'No', isCorrect: false },
            ],
        },
        {
            questionText: 'Tipo de hardware:',
            questionContent: <h1>El hardware de trabajo será :</h1>,
            answerOptions: [
                { answerText: 'Windows', isCorrect: true },
                { answerText: 'Mac/Linux', isCorrect: true },
                { answerText: 'A escoger', isCorrect: true },
            ],
        },
        {
            questionText: 'Promedio de antigüedad:',
            questionContent: <h1>La media de antigüedad de los compañeros es de :</h1>,
            answerOptions: [
                { answerText: 'Menos de 1 año', isCorrect: false },
                { answerText: 'Menos de 2 años', isCorrect: true },
                { answerText: 'Más de 2 años', isCorrect: true },
            ],
        },
        {
            questionText: 'Proceso de selección:',
            questionContent: <h1>El proceso de selección consta de :</h1>,
            answerOptions: [
                { answerText: 'Entrevistas', isCorrect: true },
                { answerText: 'Entrevistas y prueba técnica larga', isCorrect: true },
                { answerText: 'Entrevistas y prueba técnica corta', isCorrect: true },
            ],
        },
        {
            questionContent: <section>{success ? <SuccessResult /> : <FailureResult name={displayName} />}</section>,
        },
    ];
};
