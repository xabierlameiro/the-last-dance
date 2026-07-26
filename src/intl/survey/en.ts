import type { SurveyCopy } from './types';

const en: SurveyCopy = {
    seo: {
        title: 'Find out in one minute whether the role and I are a match',
        description: 'A one-minute questionnaire to see whether the role and I fit',
    },
    intro: {
        greeting: 'Hi {name}, thanks for getting in touch!',
        body: "If you have made it this far, it is probably because you have a great role and you want to tell me about it. But before we meet and you ask me a lot of questions, I would like to check a few things first, to see whether the role and I are a match.",
        reward: 'If we are, I will show you my phone number, my availability, my up-to-date CV and plenty more.',
        cta: 'Shall we?',
        answer: 'Yes',
    },
    questions: [
        {
            text: 'Type of role:',
            heading: 'The role is for a profile that is:',
            options: ['Frontend', 'Backend', 'Fullstack'],
        },
        {
            text: 'Type of contract:',
            heading: 'The contract will be:',
            options: ['Fully remote, but within Spain only', 'Fully remote, anywhere in the world', 'Neither of those'],
        },
        {
            text: 'Salary range:',
            heading: 'The salary range is:',
            options: ['€59,000 or less', 'Between €60,000 and €69,000', '€70,000 or more'],
        },
        {
            text: 'Type of team:',
            heading: 'The team will be:',
            options: ['National', 'International', "I don't know"],
        },
        {
            text: 'Variable pay:',
            heading: 'Will part of the salary be variable?',
            options: ['Yes', 'No', "I don't know"],
        },
        {
            text: 'Holiday allowance:',
            heading: 'The holiday allowance is:',
            options: ['22 - 23 days', '24 - 26 days', '27 days or more'],
        },
        {
            text: 'Flexible hours:',
            heading: 'Are the working hours flexible?',
            options: ['Yes, with some caveats', 'Yes, completely', 'No'],
        },
        {
            text: 'Type of hardware:',
            heading: 'The work hardware will be:',
            options: ['Windows', 'Mac/Linux', 'My choice'],
        },
        {
            text: 'Average tenure:',
            heading: 'The average tenure of the team is:',
            options: ['Less than 1 year', 'Less than 2 years', 'More than 2 years'],
        },
        {
            text: 'Hiring process:',
            heading: 'The hiring process consists of:',
            options: ['Interviews', 'Interviews and a long technical test', 'Interviews and a short technical test'],
        },
    ],
    success: {
        heading: 'OMG! We are a match',
        contact: 'Want to tell me more?',
        celebrationAlt: 'Celebration',
        scheduleCaption: 'When you can call me',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        email: 'Write to me at',
        github: 'A link to my',
        linkedin: 'A link to my',
        cv: 'Download my',
        cvLabel: 'CV',
    },
    failure: {
        heading: 'I am very sorry, {name}',
        disappointedAlt: 'Disappointment',
        body: 'It looks like the role and I are not a match at the moment.',
        thanks: 'Thank you very much for your time, and I hope you find what you are looking for soon.',
        farewell: 'All the best. Xabier! 👋',
    },
};

export default en;
