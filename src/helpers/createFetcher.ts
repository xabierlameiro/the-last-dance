import type * as z from 'zod/mini';
import { describeIssues } from '../types/schemas';

/**
 * SDD-L07. One SWR fetcher, built from a schema.
 *
 * Before this the codebase had two conventions for the same job: six near-identical hand-rolled
 * `fetchX` functions (each one an `await fetch`, an `if (!res.ok) throw`, and a `return data as X`),
 * and a generic `fetcher` in `helpers/index.ts` returning `unknown`, used by `useWeather` and
 * `useGithubStars`. The duplicated convention was the majority, and every copy of it ended in a cast
 * the compiler believed and the runtime never checked.
 *
 * The cast is the part worth removing. `as` emits no code: when `/api/analytics` answered
 * `{"pageViews":"12345"}` — which it did, because GA4 returns strings — the value travelled on as a
 * `number` and surfaced four components later as an unseparated counter. `safeParse` turns that into
 * a thrown error at the boundary, naming the field.
 */

/**
 * Thrown when a response parses as JSON but does not match the contract.
 *
 * A distinct type so callers can tell "the route failed" from "the route answered something we do
 * not understand". Those deserve different words in front of a reader, and until now every widget
 * showed the same undifferentiated error icon for both.
 */
export class ResponseShapeError extends Error {
    readonly label: string;

    constructor(label: string, detail: string) {
        super(`${label}: unexpected response shape — ${detail}`);
        this.name = 'ResponseShapeError';
        this.label = label;
    }
}

/** Thrown when the route itself failed, i.e. answered a non-2xx status. */
export class ResponseStatusError extends Error {
    readonly status: number;

    constructor(label: string, status: number, statusText: string) {
        const reason = statusText ? `${status} ${statusText}` : String(status);
        super(`${label}: request failed with ${reason}`);
        this.name = 'ResponseStatusError';
        this.status = status;
    }
}

/**
 * @description Build an SWR fetcher that validates the response against `schema`.
 * @param schema - The zod schema that *is* the contract for this route; the return type follows it.
 * @param label - Route name, carried into the thrown message so a log says which boundary broke.
 * @returns A fetcher usable directly as SWR's second argument.
 * @example const fetchXRP = createFetcher(xrpSchema, '/api/xrp');
 */
const createFetcher =
    <Schema extends z.ZodMiniType>(schema: Schema, label: string) =>
    async (url: string): Promise<z.infer<Schema>> => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new ResponseStatusError(label, response.status, response.statusText);
        }

        const result = schema.safeParse(await response.json());
        if (!result.success) {
            throw new ResponseShapeError(label, describeIssues(result.error.issues));
        }
        return result.data;
    };

export default createFetcher;
