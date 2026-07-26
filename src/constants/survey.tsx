import React from 'react';
import type { SurveyCopy } from '../intl/survey/types';

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

/**
 * SDD-L08-T7. Which answers count as a match, kept here with the logic while the wording moved to
 * `src/intl/survey/`.
 *
 * The split is the point: a translator editing copy cannot change the outcome of the questionnaire,
 * and reading this array tells you what the survey actually tests without wading through prose. The
 * order matches `SurveyCopy['questions'][n].options` exactly.
 */
const ANSWER_KEY: Array<[boolean, boolean, boolean]> = [
    [true, false, false], // Frontend / Backend / Fullstack
    [true, true, false], // remote in Spain / remote worldwide / neither
    [false, true, true], // ≤59k / 60–69k / ≥70k
    [true, true, true], // national / international / unknown
    [false, true, true], // variable pay: yes / no / unknown
    [true, true, true], // 22-23 / 24-26 / 27+ days
    [true, true, false], // flexible with caveats / fully flexible / not flexible
    [true, true, true], // Windows / Mac-Linux / my choice
    [false, true, true], // <1y / <2y / >2y average tenure
    [true, true, true], // interviews / + long test / + short test
];

const SCHEDULE_HOURS: string[][] = [
    ['10:00 - 14:15', '17:45 - 21:00'],
    ['10:00 - 14:15', '17:45 - 21:00'],
    ['10:00 - 14:15', '17:45 - 21:00'],
    ['10:00 - 14:15', '17:45 - 21:00'],
    ['10:00 - 14:15'],
];

const CONTACT = {
    phone: '+34603018268',
    phoneLabel: '603 018 268',
    email: 'xabier.lameiro@gmail.com',
    github: 'https://github.com/xabierlameiro',
    linkedin: 'https://www.linkedin.com/in/xlameiro/',
    cv: '/xabierlameiro.com.pdf',
};

const SuccessResult = ({ copy }: { copy: SurveyCopy }) => (
    <>
        <h1>{copy.success.heading}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- animated gif, next/image would strip the animation */}
        <img src="/celebration.gif" alt={copy.success.celebrationAlt} width="100%" />
        <h2>
            {copy.success.contact} <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneLabel}</a>
        </h2>
        {/* The schedule was a bare grid of cells with no caption saying what the hours were for. */}
        <table>
            <caption>{copy.success.scheduleCaption}</caption>
            <tbody>
                {copy.success.days.map((day, index) => (
                    <tr key={day}>
                        <td> {day} </td>
                        {(SCHEDULE_HOURS[index] ?? []).map((hour) => (
                            <td key={hour}> {hour} </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        <ul>
            <li>
                {copy.success.email}{' '}
                <a href={`mailto:${CONTACT.email}`} target="_blank" rel="noopener noreferrer">
                    {CONTACT.email}
                </a>
            </li>
            <li>
                {copy.success.github}{' '}
                <a href={CONTACT.github} target="_blank" rel="noopener noreferrer">
                    github
                </a>
            </li>
            <li>
                {copy.success.linkedin}{' '}
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
                    linkedin
                </a>
            </li>
            <li>
                {copy.success.cv}{' '}
                <a href={CONTACT.cv} download>
                    {copy.success.cvLabel}
                </a>
            </li>
        </ul>
    </>
);

const FailureResult = ({ copy, name }: { copy: SurveyCopy; name: string }) => (
    <>
        <h1>{copy.failure.heading.replace('{name}', name)}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- animated gif, next/image would strip the animation */}
        <img src="/disappointed.gif" alt={copy.failure.disappointedAlt} width="100%" />
        <p>{copy.failure.body}</p>
        <p>{copy.failure.thanks}</p>
        <p>{copy.failure.farewell}</p>
    </>
);

export const buildSurveyQuestions = (name: string, success: boolean, copy: SurveyCopy): Question[] => {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return [
        {
            questionText: copy.intro.cta,
            questionContent: (
                <>
                    <h1>{copy.intro.greeting.replace('{name}', displayName)}</h1>
                    <p>{copy.intro.body}</p>
                    <p>{copy.intro.reward}</p>
                    <h2>{copy.intro.cta}</h2>
                </>
            ),
            answerOptions: [{ answerText: copy.intro.answer, isCorrect: true }],
        },
        ...copy.questions.map((question, index) => ({
            questionText: question.text,
            questionContent: <h1>{question.heading}</h1>,
            answerOptions: question.options.map((answerText, optionIndex) => ({
                answerText,
                isCorrect: ANSWER_KEY[index]?.[optionIndex] ?? false,
            })),
        })),
        {
            questionContent: (
                <section>
                    {success ? <SuccessResult copy={copy} /> : <FailureResult copy={copy} name={displayName} />}
                </section>
            ),
        },
    ];
};
