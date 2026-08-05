/**
 * Production dependency audit gate.
 *
 * SDD-L01. Replaces a bare `npm audit --omit=dev --audit-level=high` in CI, which cannot express
 * "this specific advisory is known, unreachable, and has no upstream fix yet". The choice was
 * between weakening the gate to `--audit-level=critical` (which would also stop reporting real high
 * findings) and an explicit, dated exception. This is the exception.
 *
 * Three things make the allowlist honest rather than a mute button:
 *   1. An entry must name the advisory, why it is unreachable, and a review date.
 *   2. A stale entry FAILS the gate. If an allowlisted advisory disappears upstream, the entry has
 *      to be deleted — an allowlist that silently outlives its cause is how audit gates rot.
 *   3. A past review date FAILS the gate, so an exception cannot be permanent by neglect.
 *
 * Anything high or critical that is not allowlisted fails, exactly as before.
 *
 * SDD-L11-T3. The report is now validated before it is trusted. npm does **not** document the
 * `--json` schema (the v10 and v11 command docs describe the flag and nothing about the payload),
 * so this gate cannot rely on the shape staying put across an npm upgrade. Since the gate's whole
 * job is to say no, every way of failing to understand the report exits non-zero: an unparseable
 * payload, an unexpected shape, an unknown `auditReportVersion`, or counts that disagree with what
 * was extracted. A security gate that cannot read its input must fail closed, never silently pass.
 */
import { execFileSync } from 'node:child_process';
import * as z from 'zod/mini';
import { describeIssues } from '../src/types/schemas.ts';

const BLOCKING = new Set(['high', 'critical']);

type AllowlistEntry = {
    id: number;
    ghsa: string;
    package: string;
    reason: string;
    reviewBy: string;
};

/**
 * Empty, and the gate insists on it staying honest: it fails on an entry whose advisory no longer
 * appears, because an allowlist that outlives its advisory hides the regression if it comes back.
 *
 * The `brace-expansion` entry (1124334, GHSA-mh99-v99m-4gvg) lived here until 2026-08-05 and is gone
 * because the advisory is fixed, not waived. Keep the reasoning that replaced it, though, because it
 * is why `package.json` pins that package **per major** rather than forcing one version across the
 * tree: forcing `^5.0.8` clears the audit and breaks runtime, since minimatch@9 calls
 * `brace_expansion_1.default()` and 5.x dropped the default export. Three separate pins, each moved
 * within its own major, is the shape that satisfies both.
 */
/*
 * `sonarjs/no-empty-collection` reads the three usages below as dead because the literal is empty
 * today. Empty is this collection's correct resting state, not a defect: it is a register of
 * deliberate exceptions, and the gate's own stale-entry check exists to drive it back to empty.
 * Deleting the reads to satisfy the rule would delete the gate.
 */
/* eslint-disable sonarjs/no-empty-collection */
const ALLOWLIST: AllowlistEntry[] = [];

/**
 * The report version this gate's extraction logic is written against. npm has emitted 2 since npm 7
 * (verified against the real payload on npm 10 in CI and npm 11 locally). A different number means
 * npm changed the contract, and the correct response is to stop and re-read it — not to guess.
 */
const SUPPORTED_REPORT_VERSION = 2;

/**
 * Only the fields the gate actually reads are required. Everything else npm emits (`nodes`,
 * `effects`, `fixAvailable`, `cvss`, …) is deliberately left undeclared so a new npm field cannot
 * break the build — the strictness is aimed at the fields whose absence would make the gate lie.
 */
const severitySchema = z.enum(['info', 'low', 'moderate', 'high', 'critical']);

/** A `via` entry is either an advisory object or the name of the package that pulls one in. */
const viaSchema = z.union([
    z.string(),
    z.object({
        source: z.number(),
        title: z.string(),
    }),
]);

const vulnerabilitySchema = z.object({
    severity: severitySchema,
    via: z.array(viaSchema),
});

const countsSchema = z.object({
    info: z.number(),
    low: z.number(),
    moderate: z.number(),
    high: z.number(),
    critical: z.number(),
});

const auditReportSchema = z.object({
    auditReportVersion: z.number(),
    vulnerabilities: z.record(z.string(), vulnerabilitySchema),
    metadata: z.object({ vulnerabilities: countsSchema }),
});

/** Exit non-zero with a message that says what could not be understood. */
const failClosed = (what: string, detail: string): never => {
    console.error(`Audit gate could not read the npm audit report — failing closed.\n  ${what}: ${detail}`);
    console.error(
        '  This gate refuses to pass on a report it cannot parse, because "no advisories found" and\n' +
            '  "no advisories understood" look identical from the outside. Re-read the npm audit JSON\n' +
            '  contract for the installed npm major and update scripts/audit-gate.ts.',
    );
    process.exit(1);
};

// Resolve both executables absolutely rather than letting the shell search PATH — a PATH lookup in a
// CI script is a hijack surface, and sonarjs/no-os-command-from-path rejects it. `npm_execpath` is
// npm's own CLI entry point, set whenever this runs through an npm script.
const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) {
    console.error('Run this through npm (`npm run audit:prod`) so npm_execpath is set.');
    process.exit(1);
}

const raw = ((): string => {
    try {
        // npm audit exits non-zero when it finds anything, so the throw is expected, not an error.
        return execFileSync(process.execPath, [npmCliPath, 'audit', '--omit=dev', '--json'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    } catch (err) {
        const stdout = (err as { stdout?: string })?.stdout;
        if (stdout) return stdout;
        throw err;
    }
})();

const parsed: unknown = (() => {
    try {
        return JSON.parse(raw);
    } catch (err) {
        return failClosed('npm audit did not emit JSON', err instanceof Error ? err.message : String(err));
    }
})();

const result = auditReportSchema.safeParse(parsed);
const report = result.success
    ? result.data
    : failClosed('unexpected report shape', describeIssues(result.error.issues));

if (report.auditReportVersion !== SUPPORTED_REPORT_VERSION) {
    failClosed(
        'unsupported auditReportVersion',
        `got ${report.auditReportVersion}, this gate reads ${SUPPORTED_REPORT_VERSION}`,
    );
}

const allowedIds = new Set(ALLOWLIST.map((entry) => entry.id));

/** Advisory ids actually present in this audit, mapped to the packages they affect. */
const present = new Map<number, { title: string; packages: Set<string> }>();
for (const [pkg, vuln] of Object.entries(report.vulnerabilities)) {
    if (!BLOCKING.has(vuln.severity)) continue;
    for (const via of vuln.via) {
        if (typeof via !== 'object') continue;
        const existing = present.get(via.source);
        if (existing) {
            existing.packages.add(pkg);
            continue;
        }
        present.set(via.source, { title: via.title, packages: new Set([pkg]) });
    }
}

const counts = report.metadata.vulnerabilities;
const blockingCount = counts.high + counts.critical;

// The counts and the advisory list are different units — npm counts affected packages, this counts
// advisory sources — so they will not match. But npm reporting blocking vulnerabilities while this
// extracted none means the traversal above stopped working, which is precisely the failure a gate
// must not sleep through.
if (blockingCount > 0 && present.size === 0) {
    failClosed(
        'report understood but not usable',
        `npm counted ${blockingCount} high/critical vulnerabilities, yet no advisory could be extracted from them`,
    );
}

const failures: string[] = [];

for (const [id, info] of present) {
    if (allowedIds.has(id)) continue;
    failures.push(
        `Unreviewed advisory ${id}: ${info.title}\n` +
            `    packages: ${[...info.packages].join(', ')}\n` +
            `    Fix it, or add a dated entry to ALLOWLIST in scripts/audit-gate.ts explaining why it is unreachable.`,
    );
}

const today = new Date().toISOString().slice(0, 10);
for (const entry of ALLOWLIST) {
    if (!present.has(entry.id)) {
        failures.push(
            `Stale allowlist entry ${entry.id} (${entry.ghsa}, ${entry.package}): the advisory no longer ` +
                `appears in the production audit. Delete the entry — it is now hiding nothing and would ` +
                `hide a regression if the advisory returned.`,
        );
        continue;
    }
    if (entry.reviewBy < today) {
        failures.push(
            `Allowlist entry ${entry.id} (${entry.ghsa}) was due for review on ${entry.reviewBy}. ` +
                `Re-check whether an upstream fix exists, then either remove the entry or move the date.`,
        );
    }
}

console.log(
    `Production audit: ${counts.critical} critical, ${counts.high} high, ` +
        `${counts.moderate} moderate, ${counts.low} low.`,
);
for (const entry of ALLOWLIST) {
    if (present.has(entry.id)) {
        console.log(`  allowed until ${entry.reviewBy}: ${entry.ghsa} (${entry.package})`);
    }
}

if (failures.length > 0) {
    console.error(`\nAudit gate failed with ${failures.length} issue(s):\n`);
    for (const failure of failures) console.error(`  - ${failure}\n`);
    process.exit(1);
}

console.log('Audit gate passed: no unreviewed high or critical advisories in production dependencies.');
