/**
 * SDD-L08-T7. The survey's copy, separated from its logic.
 *
 * All eleven question prompts, every answer option, the success screen and the failure screen were
 * Spanish string literals inside `src/constants/survey.tsx`, on a site that ships in three
 * languages — and because they never went through react-intl, nothing reported them as missing. The
 * `onError` handler that discarded every `MISSING_TRANSLATION` would not have caught them either:
 * there was no message id to miss.
 *
 * The copy lives here rather than in the shared catalogue on purpose. It is ~60 strings per
 * language used by exactly one route, and the shared catalogue is imported by `_app`, so putting it
 * there would ship the whole survey to every visitor of every page. Imported from the survey page,
 * webpack keeps it in that route's chunk.
 *
 * Which answers are *correct* is not copy — it stays in `constants/survey.tsx` with the logic, so a
 * translation can never change the outcome of the questionnaire.
 */
export type SurveyCopy = {
    seo: { title: string; description: string };
    intro: {
        greeting: string;
        body: string;
        reward: string;
        cta: string;
        answer: string;
    };
    /** Ten questions, in order. The intro and the result screen are not in this list. */
    questions: Array<{
        /** Short label shown in the window header. */
        text: string;
        /** The question itself. */
        heading: string;
        /** Answer labels, in the same order as the correctness flags in `constants/survey.tsx`. */
        options: [string, string, string];
    }>;
    success: {
        heading: string;
        contact: string;
        celebrationAlt: string;
        scheduleCaption: string;
        days: [string, string, string, string, string];
        email: string;
        github: string;
        linkedin: string;
        cv: string;
        cvLabel: string;
    };
    failure: {
        heading: string;
        disappointedAlt: string;
        body: string;
        thanks: string;
        farewell: string;
    };
};
