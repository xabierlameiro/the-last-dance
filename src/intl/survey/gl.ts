import type { SurveyCopy } from './types';

/**
 * Galician, not Spanish spelled loosely: `desenvolvemento` rather than `desarrollo`, `traballo`
 * rather than `trabajo`, `equipo`/`escoller` per RAG usage. The blog posts carry several Spanish
 * calques that SDD-L08-T22 covers separately; this file starts clean rather than inheriting them.
 */
const gl: SurveyCopy = {
    seo: {
        title: 'Descubre nun minuto se a posición e mais eu encaixamos',
        description: 'Un cuestionario dun minuto para ver se a posición e mais eu encaixamos',
    },
    intro: {
        greeting: 'Ola {name}, grazas por poñerte en contacto!',
        body: 'Se chegaches ata aquí, seguro que é porque tes unha posición incrible e quéresma contar. Pero antes de coñecérmonos e de que me fagas moitas preguntas, a min tamén me gustaría verificar algunhas cousas primeiro, para saber se a posición e mais eu somos compatibles.',
        reward: 'Se o somos, amosareiche o meu número de teléfono, a miña dispoñibilidade, o meu currículo actualizado e moitas cousas máis.',
        cta: 'Apúntaste?',
        answer: 'Si',
    },
    questions: [
        {
            text: 'Tipo de posición:',
            heading: 'A posición é para un perfil:',
            options: ['Frontend', 'Backend', 'Fullstack'],
        },
        {
            text: 'Tipo de contrato:',
            heading: 'O contrato será:',
            options: ['Remoto 100% pero só en España', 'Remoto 100% en todo o mundo', 'Ningunha das dúas'],
        },
        {
            text: 'Rango salarial:',
            heading: 'O rango salarial é:',
            options: ['Menor ou igual a 59.000 €', 'Entre 60.000 € e 69.000 €', 'Maior ou igual a 70.000 €'],
        },
        {
            text: 'Tipo de equipo:',
            heading: 'O equipo de traballo será:',
            options: ['Nacional', 'Internacional', 'Descoñézoo'],
        },
        {
            text: 'Salario variable:',
            heading: 'O salario terá unha parte variable?',
            options: ['Si', 'Non', 'Descoñézoo'],
        },
        {
            text: 'Días de vacacións:',
            heading: 'Os días de vacacións son:',
            options: ['22 - 23', '24 - 26', '27 ou máis'],
        },
        {
            text: 'Horario de traballo flexible:',
            heading: 'O horario de traballo é flexible?',
            options: ['Si, pero con matices', 'Si, totalmente', 'Non'],
        },
        {
            text: 'Tipo de hardware:',
            heading: 'O hardware de traballo será:',
            options: ['Windows', 'Mac/Linux', 'A escoller'],
        },
        {
            text: 'Media de antigüidade:',
            heading: 'A media de antigüidade dos compañeiros é de:',
            options: ['Menos dun ano', 'Menos de dous anos', 'Máis de dous anos'],
        },
        {
            text: 'Proceso de selección:',
            heading: 'O proceso de selección consta de:',
            options: ['Entrevistas', 'Entrevistas e proba técnica longa', 'Entrevistas e proba técnica curta'],
        },
    ],
    success: {
        heading: 'OMG!!! Somos compatibles',
        contact: 'Queres contarme máis?',
        celebrationAlt: 'Celebración',
        scheduleCaption: 'Horario no que podes chamarme',
        days: ['Luns', 'Martes', 'Mércores', 'Xoves', 'Venres'],
        email: 'Escríbeme a',
        github: 'Ligazón ao meu',
        linkedin: 'Ligazón ao meu',
        cv: 'Descarga o meu',
        cvLabel: 'currículo',
    },
    failure: {
        heading: 'Sínteo moito, {name}',
        disappointedAlt: 'Decepción',
        body: 'Pero parece que a posición e mais eu non somos compatibles neste momento.',
        thanks: 'Agradézoche moito o teu tempo e espero que atopes o que buscas moi pronto.',
        farewell: 'Unha aperta. Xabier! 👋',
    },
};

export default gl;
