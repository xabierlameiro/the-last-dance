/**
 * SDD-L07. Runtime shapes for the eight API routes this site owns.
 *
 * `grep -r 'zod|safeParse' src/` returned nothing before this file existed: ten external boundaries
 * were asserted into shape with `as`, which emits no code. `strict: true` was guarding a house whose
 * front door was propped open — and the bill was already being paid, since `/api/analytics` declared
 * `pageViews: number` while GA4 emits a string, and the `as AnalyticsData` in the hook laundered it
 * back to `number`. That is why the view counter renders `12345` unseparated while the crypto price
 * next to it is formatted: one of them holds a string.
 *
 * ## Why `zod/mini` and not `zod`
 *
 * These schemas run in the browser — the widgets are in the header on every page, so whatever they
 * import lands in the shared `_app` chunk. Measured on this repo with a production build:
 *
 * | | First Load JS (shared) | `_app` chunk |
 * |---|---|---|
 * | before | 165 kB | 61.4 kB |
 * | `zod` classic, one schema | 178 kB (**+13 kB**) | 74.6 kB |
 * | `zod/mini`, one schema | 168 kB (**+3.5 kB**) | 64.9 kB |
 *
 * 13 kB on every page load, one phase after SDD-L03 spent its effort on LCP, is not a fair trade for
 * validating our own responses. 3.5 kB is. The cost of `mini` is terser error text — it drops the
 * message builder, so an issue reads "Invalid input" rather than "expected number, received string".
 * `describeIssues` below rebuilds the useful part from `issue.expected` and `issue.path`, which mini
 * does keep, so nothing is actually lost from the logs.
 *
 * Upstream third-party shapes live in `./upstream.ts` instead of here, so a schema that only a
 * serverless function needs cannot be dragged into the browser bundle by a barrel import.
 *
 * @see ./upstream.ts
 * @see @/helpers/createFetcher
 */
import * as z from 'zod/mini';

/**
 * The eight deployment states Vercel documents, not the six this codebase declared.
 * `BLOCKED` and `DELETED` were missing, and `DeploymentStatus` does
 * `styles[status.toLowerCase()]`, so either one produced an unstyled dot with no fallback.
 *
 * @see https://vercel.com/docs/rest-api/reference/endpoints/deployments/list-deployments
 */
export const deploymentStatusSchema = z.enum([
    'BLOCKED',
    'BUILDING',
    'CANCELED',
    'DELETED',
    'ERROR',
    'INITIALIZING',
    'QUEUED',
    'READY',
]);

export const deploymentEnvironmentSchema = z.enum(['production', 'preview']);

/**
 * `createdAt`, `buildingAt` and `ready` are `string` here but **numbers** upstream — Vercel documents
 * all three as unix-millisecond timestamps. The route used to forward them untouched under a `string`
 * annotation, and `new Date()` accepts both, so the lie never surfaced. The route now converts them
 * to ISO strings, which makes this declaration true by construction rather than by luck.
 */
export const deploymentSchema = z.object({
    status: deploymentStatusSchema,
    environment: deploymentEnvironmentSchema,
    createdAt: z.string(),
    buildingAt: z.string(),
    ready: z.string(),
    username: z.string(),
});

export const analyticsSchema = z.object({
    pageViews: z.number(),
    newUsers: z.number(),
});

export const heatingSchema = z.object({
    outsideTemp: z.number(),
    zoneMeasuredTemp: z.number(),
});

export const counterSchema = z.object({
    num: z.number(),
});

export const newsItemSchema = z.object({
    link: z.string(),
    title: z.string(),
    published: z.string(),
    description: z.string(),
});

export const newsSchema = z.object({
    news: z.array(newsItemSchema),
});

/**
 * SDD-L08-T20: `todayPorcentage` — not a word in English, Spanish (`porcentaje`) or Galician
 * (`porcentaxe`). It was the API field name, the contract field name, and the ICU placeholder in all
 * three catalogues, so the misspelling had propagated from the route to the rendered tooltip.
 *
 * The only consumer of `/api/xrp` is this site's own widget, so renaming the response field is safe.
 */
export const xrpSchema = z.object({
    price: z.number(),
    todaySummary: z.string(),
    todayPercentage: z.string(),
});

/**
 * Nullable rather than optional on purpose: `/api/weather` answers with an explicit `null` per field
 * when a city geocodes but has no current forecast, so the widget can tell "no reading" from "not
 * asked". `imageUrl` really is absent when the weather code has no icon.
 */
export const weatherItemSchema = z.object({
    city: z.string(),
    name: z.nullable(z.string()),
    precipitation: z.nullable(z.string()),
    humidity: z.nullable(z.string()),
    windSpeed: z.nullable(z.string()),
    grades: z.nullable(z.string()),
    imageUrl: z.optional(z.string()),
});

export const weatherSchema = z.array(weatherItemSchema);

export const githubStarsSchema = z.number();

export type DeploymentStatus = z.infer<typeof deploymentStatusSchema>;
export type DeploymentEnvironment = z.infer<typeof deploymentEnvironmentSchema>;
export type DeploymentData = z.infer<typeof deploymentSchema>;
export type AnalyticsData = z.infer<typeof analyticsSchema>;
export type HeatingData = z.infer<typeof heatingSchema>;
export type CounterData = z.infer<typeof counterSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type NewsData = z.infer<typeof newsSchema>;
export type XRPData = z.infer<typeof xrpSchema>;
export type WeatherData = z.infer<typeof weatherItemSchema>;

/**
 * @description Turn a validation failure into one line a human can act on.
 *
 * `zod/mini` issues carry `path`, `code` and `expected` but a generic `message`, so this rebuilds
 * what the classic build would have said. Used for both the client-side error and the server log —
 * the whole point of the phase is that "the widget broke" becomes "news[0].published expected
 * string".
 */
export const describeIssues = (issues: readonly { path: PropertyKey[]; expected?: string; code: string }[]): string =>
    issues
        .map((issue) => {
            const where = issue.path.length > 0 ? issue.path.map(String).join('.') : '(root)';
            const what = issue.expected ? `expected ${issue.expected}` : issue.code;
            return `${where} ${what}`;
        })
        .join('; ');
