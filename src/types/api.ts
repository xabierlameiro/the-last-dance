/**
 * The response contracts for this site's own API routes.
 *
 * SDD-L07: these were nine hand-written `interface` declarations sitting next to ten `as X` casts
 * that claimed to produce them. They are now derived from the runtime schemas in `./schemas.ts` via
 * `z.infer`, so a contract cannot drift from what is actually checked at the boundary — one source
 * of truth instead of a type plus an unenforced promise.
 *
 * This module stays as the import path every component and hook already uses, and re-exports
 * type-only so nothing here can pull the schema values — and with them zod — into a bundle that
 * only wanted a type.
 */
export type {
    AnalyticsData,
    CounterData,
    DeploymentData,
    DeploymentEnvironment,
    DeploymentStatus,
    HeatingData,
    NewsData,
    NewsItem,
    WeatherData,
    XRPData,
} from './schemas';
