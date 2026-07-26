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
 */
import { execFileSync } from 'node:child_process';

const BLOCKING = new Set(['high', 'critical']);

/**
 * @type {Array<{id: number, ghsa: string, package: string, reason: string, reviewBy: string}>}
 */
const ALLOWLIST = [
    {
        id: 1124334,
        ghsa: 'GHSA-mh99-v99m-4gvg',
        package: 'brace-expansion',
        reason:
            'DoS via unbounded brace expansion (CWE-400/770, CVSS 7.5), range <=5.0.7. Reached only ' +
            'as googleapis -> googleapis-common -> gaxios -> rimraf -> glob -> minimatch -> ' +
            'brace-expansion. rimraf runs on googleapis\' own cleanup paths; no request-controlled ' +
            'string reaches a glob pattern anywhere in this app (searchConsole.ts passes fixed ' +
            'resource names, and api/indexed-pages.ts reads a fixed literal path), so the ' +
            'expansion this advisory abuses is never fed attacker input. ' +
            'No upstream fix: googleapis is already at its latest (173.0.0) and the vulnerable ' +
            'chain sits below it. Forcing brace-expansion to ^5.0.8 via overrides was tried and ' +
            'REJECTED — it clears the audit but breaks runtime, because minimatch@9 calls ' +
            'brace_expansion_1.default() and 5.x dropped the default export ' +
            '("TypeError: (0, brace_expansion_1.default) is not a function"). A green audit over ' +
            'broken globbing is worse than a documented exception.',
        reviewBy: '2026-10-26',
    },
];

// Resolve both executables absolutely rather than letting the shell search PATH — a PATH lookup in a
// CI script is a hijack surface, and sonarjs/no-os-command-from-path rejects it. `npm_execpath` is
// npm's own CLI entry point, set whenever this runs through an npm script.
const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) {
    console.error('Run this through npm (`npm run audit:prod`) so npm_execpath is set.');
    process.exit(1);
}

const raw = (() => {
    try {
        // npm audit exits non-zero when it finds anything, so the throw is expected, not an error.
        return execFileSync(process.execPath, [npmCliPath, 'audit', '--omit=dev', '--json'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    } catch (err) {
        if (err.stdout) return err.stdout;
        throw err;
    }
})();

const report = JSON.parse(raw);
const allowedIds = new Set(ALLOWLIST.map((entry) => entry.id));

/** Advisory ids actually present in this audit, mapped to the packages they affect. */
const present = new Map();
for (const [pkg, vuln] of Object.entries(report.vulnerabilities ?? {})) {
    if (!BLOCKING.has(vuln.severity)) continue;
    for (const via of vuln.via) {
        if (typeof via !== 'object') continue;
        if (!present.has(via.source)) present.set(via.source, { title: via.title, packages: new Set() });
        present.get(via.source).packages.add(pkg);
    }
}

const failures = [];

for (const [id, info] of present) {
    if (allowedIds.has(id)) continue;
    failures.push(
        `Unreviewed advisory ${id}: ${info.title}\n` +
            `    packages: ${[...info.packages].join(', ')}\n` +
            `    Fix it, or add a dated entry to ALLOWLIST in scripts/audit-gate.mjs explaining why it is unreachable.`
    );
}

const today = new Date().toISOString().slice(0, 10);
for (const entry of ALLOWLIST) {
    if (!present.has(entry.id)) {
        failures.push(
            `Stale allowlist entry ${entry.id} (${entry.ghsa}, ${entry.package}): the advisory no longer ` +
                `appears in the production audit. Delete the entry — it is now hiding nothing and would ` +
                `hide a regression if the advisory returned.`
        );
        continue;
    }
    if (entry.reviewBy < today) {
        failures.push(
            `Allowlist entry ${entry.id} (${entry.ghsa}) was due for review on ${entry.reviewBy}. ` +
                `Re-check whether an upstream fix exists, then either remove the entry or move the date.`
        );
    }
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
    `Production audit: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
        `${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low.`
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
