/**
 * SDD-L07. Shapes of the third-party responses this site's API routes consume.
 *
 * Kept out of `./schemas.ts` deliberately: those run in the browser, these run only inside serverless
 * functions, and one barrel import is all it takes for a schema nobody in the browser needs to end up
 * in the shared chunk. Nothing here is imported from a component or a hook.
 *
 * Every schema is loose about fields the routes do not read. The goal is not to model Vercel or
 * Open-Meteo completely — it is to fail with a sentence naming the field that moved, instead of a
 * `TypeError: Cannot read properties of undefined` fifteen lines later.
 */
import * as z from 'zod/mini';

/**
 * Vercel `GET /v6/deployments`.
 *
 * `state`, `buildingAt`, `ready` and `creator.username` are all optional in the documented schema —
 * only `uid`, `createdAt`, `creator`, `name`, `projectId`, `readyState`, `type` and `url` are
 * required. The route treated all of them as present.
 *
 * The three timestamps are `number` (unix ms). `types/api.ts` declared them `string`, and since
 * `new Date()` takes either, the mismatch never showed. The route converts rather than forwards now.
 *
 * @see https://vercel.com/docs/rest-api/reference/endpoints/deployments/list-deployments
 */
export const vercelDeploymentsSchema = z.object({
    deployments: z.optional(
        z.array(
            z.object({
                state: z.optional(z.string()),
                readyState: z.optional(z.string()),
                createdAt: z.optional(z.number()),
                buildingAt: z.optional(z.number()),
                ready: z.optional(z.number()),
                creator: z.optional(z.object({ username: z.optional(z.string()) })),
            })
        )
    ),
});

/**
 * CoinGecko `simple/price?ids=ripple&vs_currencies=eur&include_24hr_change=true`.
 *
 * The route did `data.ripple.eur.toFixed(4)` after checking only that `data.ripple` exists. A
 * response with `ripple` present but `eur` missing — which is what CoinGecko returns for an
 * unsupported currency, not an error status — threw a `TypeError` caught by the outer handler and
 * reported as a flat 500, so the log said nothing about why.
 */
export const coinGeckoXrpSchema = z.object({
    ripple: z.object({
        eur: z.number(),
        eur_24h_change: z.number(),
    }),
});

/** Open-Meteo geocoding. `results` is absent, not empty, for an unknown place. */
export const geocodingSchema = z.object({
    results: z.optional(
        z.array(
            z.object({
                latitude: z.number(),
                longitude: z.number(),
                name: z.string(),
                country: z.optional(z.string()),
            })
        )
    ),
});

/** Open-Meteo forecast, `current=` block. */
export const forecastSchema = z.object({
    current: z.optional(
        z.object({
            temperature_2m: z.number(),
            relative_humidity_2m: z.number(),
            precipitation: z.number(),
            wind_speed_10m: z.number(),
            weather_code: z.number(),
        })
    ),
});

/**
 * MDX frontmatter, as gray-matter hands it over.
 *
 * `helpers/fileReader.ts` typed this `Record<string, any>` and cast the result to `PathPost`. All 45
 * posts currently carry every required field, so this is latent — but it is the one place the `as`
 * pattern can break a **deploy** rather than a widget: `getStaticPaths` maps over the corpus and
 * `blog/[category]/[slug].tsx` reads `post.category`, so one post published without a category throws
 * during `next build` with no filename in the message. Validation turns that into a named field in a
 * named file.
 *
 * Deliberately permissive on everything the router does not need — `passthrough` semantics are not
 * used, but unknown keys are simply stripped from the parsed value while the raw object stays
 * available to callers that read extra frontmatter.
 */
export const postFrontmatterSchema = z.object({
    title: z.string(),
    category: z.string(),
    slug: z.optional(z.string()),
    date: z.optional(z.union([z.string(), z.date()])),
});
