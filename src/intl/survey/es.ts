import type { SurveyCopy } from './types';

/**
 * The original copy, which was hardcoded in `constants/survey.tsx`.
 *
 * Two orthographic corrections carried over while moving it, both objective rather than editorial:
 * the affirmative is `Sí` with an accent (`si` unaccented is the conditional conjunction, "if"),
 * and Spanish sets `¿…?` tight against the text, not `¿ … ?`.
 */
const es: SurveyCopy = {
    seo: {
        title: 'Averigua si hago match con la posición en 1 minuto',
        description: 'Un cuestionario de un minuto para ver si la posición y yo encajamos',
    },
    intro: {
        greeting: '¡Hola {name}, gracias por ponerte en contacto!',
        body: 'Si has llegado hasta aquí, seguro que es porque tienes una posición increíble y me la quieres contar. Pero antes de conocernos y de que me hagas muchas preguntas, a mí también me gustaría verificar algunas cosas primero, para saber si la posición y yo somos compatibles.',
        reward: 'Si lo somos, te mostraré mi número de teléfono, mi disponibilidad, mi currículum actualizado y muchas cosas más.',
        cta: '¿Te apuntas?',
        answer: 'Sí',
    },
    questions: [
        {
            text: 'Tipo de posición:',
            heading: 'La posición es para un perfil:',
            options: ['Frontend', 'Backend', 'Fullstack'],
        },
        {
            text: 'Tipo de contrato:',
            heading: 'El contrato será:',
            options: ['Remoto 100% pero solo en España', 'Remoto 100% en todo el mundo', 'Ninguna de las dos'],
        },
        {
            text: 'Rango salarial:',
            heading: 'El rango salarial es:',
            options: ['Menor o igual a 59.000 €', 'Entre 60.000 € y 69.000 €', 'Mayor o igual a 70.000 €'],
        },
        {
            text: 'Tipo de equipo:',
            heading: 'El equipo de trabajo será:',
            options: ['Nacional', 'Internacional', 'Lo desconozco'],
        },
        {
            text: 'Salario variable:',
            heading: '¿El salario tendrá una parte variable?',
            options: ['Sí', 'No', 'Lo desconozco'],
        },
        {
            text: 'Días de vacaciones:',
            heading: 'Los días de vacaciones son:',
            options: ['22 - 23', '24 - 26', '27 o más'],
        },
        {
            text: 'Horario de trabajo flexible:',
            heading: '¿El horario de trabajo es flexible?',
            options: ['Sí, pero con matices', 'Sí, totalmente', 'No'],
        },
        {
            text: 'Tipo de hardware:',
            heading: 'El hardware de trabajo será:',
            options: ['Windows', 'Mac/Linux', 'A escoger'],
        },
        {
            text: 'Promedio de antigüedad:',
            heading: 'La media de antigüedad de los compañeros es de:',
            options: ['Menos de 1 año', 'Menos de 2 años', 'Más de 2 años'],
        },
        {
            text: 'Proceso de selección:',
            heading: 'El proceso de selección consta de:',
            options: ['Entrevistas', 'Entrevistas y prueba técnica larga', 'Entrevistas y prueba técnica corta'],
        },
    ],
    success: {
        heading: '¡¡¡OMG!!! Somos compatibles',
        contact: '¿Quieres contarme más?',
        celebrationAlt: 'Celebración',
        scheduleCaption: 'Horario en el que puedes llamarme',
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        email: 'Escríbeme a',
        github: 'Enlace a mi',
        linkedin: 'Enlace a mi',
        cv: 'Descárgate mi',
        cvLabel: 'currículum',
    },
    failure: {
        heading: 'Lo siento mucho, {name}',
        disappointedAlt: 'Decepción',
        body: 'Pero parece que la posición y yo no somos compatibles en estos momentos.',
        thanks: 'Te agradezco mucho tu tiempo y espero que encuentres lo que buscas muy pronto.',
        farewell: 'Un saludo. ¡Xabier! 👋',
    },
};

export default es;
