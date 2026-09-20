/**
 * /next-coverage — the sibling of /next-leak.
 *
 * Same window, same tabs pattern, same contract with the data: every number on this page comes from
 * one real run of the published CLI, recorded in `src/constants/nextCoverage.ts` with its date, its
 * commit and its Next.js version.
 *
 * The rule this page must not break: nothing it shows is an error. The tool reports what a project
 * uses and what would apply to it; "would apply" is an opportunity, and the copy and the palette both
 * have to say so.
 */
import React from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsBoxArrowUpRight, BsBug, BsCheck2, BsClipboard, BsEyeSlash, BsListUl, BsSliders } from 'react-icons/bs';
import SEO from '@/components/SEO';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { pageBreadcrumbJsonLd, softwareApplicationJsonLd } from '@/components/SEO/jsonLd';
import { clx } from '@/helpers';
import { BUCKETS, nextCoverage, type Bucket, type Finding } from '@/constants/nextCoverage';
import styles from '@/styles/next-coverage.module.css';

const SECTIONS = [
    { id: 'overview', labelId: 'nextCoverage.nav.overview', Icon: BsListUl },
    { id: 'run', labelId: 'nextCoverage.nav.run', Icon: BsBug },
    { id: 'buckets', labelId: 'nextCoverage.nav.buckets', Icon: BsSliders },
    { id: 'presets', labelId: 'nextCoverage.nav.presets', Icon: BsSliders },
    { id: 'limits', labelId: 'nextCoverage.nav.limits', Icon: BsEyeSlash },
    { id: 'links', labelId: 'nextCoverage.nav.links', Icon: BsBoxArrowUpRight },
] as const;

type Section = (typeof SECTIONS)[number]['id'];

const tabId = (section: Section) => `next-coverage-tab-${section}`;
const panelId = (section: Section) => `next-coverage-panel-${section}`;

// Inline code inside translated copy: flags and API names stay as the CLI prints them.
const code = (chunks: React.ReactNode) => <code className={styles.code}>{chunks}</code>;

// CSS-module keys are typed as possibly absent; `clx` already accepts that.
const BUCKET_CLASS: Record<Bucket, string | undefined> = {
    used: styles.bucketUsed,
    wouldApply: styles.bucketWouldApply,
    notApplicable: styles.bucketNotApplicable,
    notEvaluated: styles.bucketNotEvaluated,
};

const run = nextCoverage.exampleRun;

const Buckets = () => {
    const { formatMessage: f } = useIntl();
    return (
        <ul className={styles.buckets}>
            {BUCKETS.map((bucket) => (
                <li key={bucket} className={clx(styles.bucket, BUCKET_CLASS[bucket])}>
                    <span className={styles.bucketCount}>{run.counts[bucket]}</span>
                    <span className={styles.bucketName}>{f({ id: `nextCoverage.bucket.${bucket}` })}</span>
                    <span className={styles.bucketWhat}>{f({ id: `nextCoverage.bucket.${bucket}.what` })}</span>
                </li>
            ))}
        </ul>
    );
};

const Overview = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.overview' })}</h2>
            <p>{f({ id: 'nextCoverage.overview.lead' }, { code })}</p>
            <Buckets />
            <p className={styles.note}>{f({ id: 'nextCoverage.overview.note' }, { code })}</p>
            <p>{f({ id: 'nextCoverage.overview.reads' })}</p>
        </div>
    );
};

const FindingBlock = ({ finding }: { finding: Finding }) => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.finding}>
            <div className={styles.findingHead}>
                <span className={styles.findingApi}>{finding.api}</span>
                <span className={styles.findingGroup}>{finding.group}</span>
            </div>
            <p className={styles.findingWhat}>{finding.what}</p>
            <p className={styles.findingWhy}>{finding.why}</p>
            {finding.detail && <span className={styles.findingTag}>{finding.detail}</span>}
            <ul className={styles.findingFiles}>
                {finding.files.map((file) => (
                    <li key={file}>{file}</li>
                ))}
                {finding.more !== undefined && (
                    <li className={styles.findingMore}>
                        {f({ id: 'nextCoverage.run.andMore' }, { count: finding.more })}
                    </li>
                )}
            </ul>
            <p className={styles.findingWhy}>
                <a href={finding.docs}>{f({ id: 'nextCoverage.run.docs' })}</a>
            </p>
        </div>
    );
};

const Run = () => {
    const { formatMessage: f } = useIntl();
    const widest = Math.max(...run.clientWeight.map(({ modules }) => modules));
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.run' })}</h2>
            <p className={styles.runHeader}>
                <span>{run.header}</span>
                <span className={styles.runMeta}>
                    {f({ id: 'nextCoverage.run.meta' }, { seconds: run.seconds, entries: run.entries })}
                </span>
            </p>
            <p>
                {f(
                    { id: 'nextCoverage.run.lead' },
                    {
                        project: (
                            <a key="project" href={run.commitUrl}>
                                {run.project}
                            </a>
                        ),
                        commit: (
                            <code key="commit" className={styles.code}>
                                {run.commitShort}
                            </code>
                        ),
                        version: run.nextVersion,
                    },
                )}
            </p>
            <Buckets />
            <p className={styles.note}>{run.summary}</p>

            <h2>{f({ id: 'nextCoverage.run.findings' }, { count: run.findings.length })}</h2>
            {run.findings.map((finding) => (
                <FindingBlock key={finding.api} finding={finding} />
            ))}

            {/* The lead finding, checked by reading the project rather than by trusting the tool. */}
            <h2>{f({ id: 'nextCoverage.run.checkTitle' })}</h2>
            <p className={styles.block}>
                {[
                    nextCoverage.verification.declares,
                    nextCoverage.verification.alsoDeclares,
                    nextCoverage.verification.invalidates,
                ].join('\n')}
            </p>
            <p>{nextCoverage.verification.conclusion}</p>
            <p>{f({ id: 'nextCoverage.run.checkMeaning' }, { code })}</p>
            <p className={styles.note}>{f({ id: 'nextCoverage.run.checkFair' }, { code })}</p>

            <h2>{f({ id: 'nextCoverage.run.weight' })}</h2>
            <ul className={styles.weight}>
                {run.clientWeight.map(({ route, modules }) => (
                    <li key={route} className={styles.weightRow}>
                        <span className={styles.weightRoute}>{route}</span>
                        <span
                            className={styles.weightBar}
                            style={{ width: `${Math.round((modules / widest) * 100)}%` }}
                            aria-hidden="true"
                        />
                        <span className={styles.weightCount}>
                            {f({ id: 'nextCoverage.run.modules' }, { count: modules })}
                        </span>
                    </li>
                ))}
            </ul>
            <p className={styles.note}>
                {f({ id: 'nextCoverage.run.weightMore' }, { count: run.clientWeightMoreRoutes })}
            </p>
            <p className={styles.note}>{run.buildContrast}</p>
        </div>
    );
};

const BucketsPanel = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.buckets' })}</h2>
            <Buckets />
            <p>{f({ id: 'nextCoverage.buckets.opportunity' }, { code })}</p>
            <h2>{f({ id: 'nextCoverage.buckets.silence' })}</h2>
            <p>{f({ id: 'nextCoverage.buckets.silenceLead' }, { count: run.counts.notEvaluated })}</p>
            <div className={styles.disclosure}>
                <ul>
                    {run.notEvaluatedBreakdown.map(({ count, what }) => (
                        <li key={what}>
                            <strong>{count}</strong> {what}
                        </li>
                    ))}
                </ul>
            </div>
            <p className={styles.note}>{f({ id: 'nextCoverage.buckets.silenceNote' })}</p>
        </div>
    );
};

const Presets = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.presets' })}</h2>
            <p>{f({ id: 'nextCoverage.presets.default' }, { code, count: run.findings.length })}</p>
            <p>{f({ id: 'nextCoverage.presets.strict' }, { code, count: run.findingsInStrict })}</p>
            <p className={styles.block}>{nextCoverage.strict}</p>
            <div className={styles.disclosure}>
                <p>{f({ id: 'nextCoverage.presets.withheld' }, { count: run.withheld, code })}</p>
                <p>{f({ id: 'nextCoverage.presets.constraints' }, { count: run.constraintsChecked })}</p>
            </div>
            <p className={styles.note}>{f({ id: 'nextCoverage.presets.same' }, { code })}</p>
        </div>
    );
};

const Limits = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.limits' })}</h2>
            <ul>
                <li>{f({ id: 'nextCoverage.limits.reads' })}</li>
                <li>{f({ id: 'nextCoverage.limits.requirements' }, { requirements: nextCoverage.requirements })}</li>
                <li>{f({ id: 'nextCoverage.limits.build' }, { code })}</li>
                <li>{f({ id: 'nextCoverage.limits.version' }, { version: nextCoverage.version, code })}</li>
                <li>{f({ id: 'nextCoverage.limits.notLinter' })}</li>
            </ul>
        </div>
    );
};

const Links = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextCoverage.nav.links' })}</h2>
            <ul className={styles.links}>
                <li>
                    <a href={nextCoverage.repository}>github.com/xabierlameiro/next-coverage</a>
                    <span>{f({ id: 'nextCoverage.links.repository' })}</span>
                </li>
                <li>
                    <a href={nextCoverage.npm}>npmjs.com/package/next-coverage</a>
                    <span>{f({ id: 'nextCoverage.links.npm' })}</span>
                </li>
                <li>
                    <a href={nextCoverage.npmx}>npmx.dev/package/next-coverage</a>
                    <span>{f({ id: 'nextCoverage.links.npmx' })}</span>
                </li>
                <li>
                    <Link href="/next-leak">next-leak</Link>
                    <span>{f({ id: 'nextCoverage.links.sibling' })}</span>
                </li>
                <li>
                    <a href={nextCoverage.newIssue}>{f({ id: 'nextCoverage.links.report' })}</a>
                </li>
            </ul>
        </div>
    );
};

const Titlebar = () => {
    const { formatMessage: f, locale } = useIntl();
    const router = useRouter();
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) return undefined;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const close = () => {
        router.push('/', '/', { locale: router.locale ?? locale });
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(nextCoverage.install);
            setCopied(true);
        } catch {
            // No clipboard (insecure context, denied permission): the command stays selectable.
        }
    };

    return (
        <div className={styles.titlebar}>
            <div className={styles.toolbar}>
                <ControlButtons disabled onClickClose={close} onClickMinimise={close} />
                <div className={styles.appName}>
                    <span className={styles.appTitle}>next-coverage</span>
                    <span className={styles.appVersion}>{`${nextCoverage.version} · CLI`}</span>
                </div>
                <div className={styles.install}>
                    <code className={styles.command}>{nextCoverage.install}</code>
                    <button
                        type="button"
                        className={styles.copyButton}
                        onClick={copy}
                        aria-label={f({ id: 'nextCoverage.copyLabel' }, { command: nextCoverage.install })}
                    >
                        {copied ? (
                            <BsCheck2 aria-hidden="true" className={styles.copyIcon} />
                        ) : (
                            <BsClipboard aria-hidden="true" className={styles.copyIcon} />
                        )}
                        <span aria-live="polite">
                            {f({ id: copied ? 'nextCoverage.copied' : 'nextCoverage.copy' })}
                        </span>
                    </button>
                </div>
            </div>
            <p className={styles.pitch}>{f({ id: 'nextCoverage.pitch' })}</p>
        </div>
    );
};

const NextCoverage = () => {
    const { formatMessage: f, formatDate } = useIntl();
    const [section, setSection] = React.useState<Section>('run');
    const tabs = React.useRef<Array<HTMLButtonElement | null>>([]);

    // UTC so the server and the browser agree on the day and hydration does not mismatch.
    const checkedAt = formatDate(nextCoverage.checkedAt, { dateStyle: 'medium', timeZone: 'UTC' });

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const current = SECTIONS.findIndex(({ id }) => id === section);
        const moves: Partial<Record<string, number>> = {
            ArrowDown: current + 1,
            ArrowRight: current + 1,
            ArrowUp: current - 1,
            ArrowLeft: current - 1,
            Home: 0,
            End: SECTIONS.length - 1,
        };
        const move = moves[event.key];
        if (move === undefined) return;
        event.preventDefault();
        const next = (move + SECTIONS.length) % SECTIONS.length;
        const target = SECTIONS[next];
        if (!target) return;
        setSection(target.id);
        tabs.current[next]?.focus();
    };

    const panels: Record<Section, React.ReactNode> = {
        overview: <Overview />,
        run: <Run />,
        buckets: <BucketsPanel />,
        presets: <Presets />,
        limits: <Limits />,
        links: <Links />,
    };

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'nextCoverage.seo.title' }),
                    description: f({ id: 'nextCoverage.seo.description' }),
                    image: '/og-next-coverage.png',
                }}
                jsonLd={({ url, domain, author, langPrefix }) => [
                    softwareApplicationJsonLd({
                        name: 'next-coverage',
                        description: f({ id: 'nextCoverage.seo.description' }),
                        url,
                        version: nextCoverage.version,
                        operatingSystem: 'Linux, macOS',
                        requirements: 'Node.js 20.19 or later',
                        sameAs: [nextCoverage.repository, nextCoverage.npm],
                        author,
                        domain,
                    }),
                    pageBreadcrumbJsonLd({ name: 'next-coverage', url, langPrefix, domain }),
                ]}
            />

            {/* The window chrome is the visual title, as on /next-leak. */}
            <h1 className="visuallyHidden">{f({ id: 'nextCoverage.seo.title' })}</h1>
            <Dialog
                open
                modalMode
                large
                label="next-coverage"
                header={<Titlebar />}
                body={
                    <div className={styles.body}>
                        <div className={styles.sidebar}>
                            <p className={styles.sidebarTitle} aria-hidden="true">
                                {f({ id: 'nextCoverage.sections' })}
                            </p>
                            {/* Content first: every panel is in the server HTML, inactive ones
                                `hidden`, so crawlers and no-JS readers get all six sections. */}
                            <div role="tablist" aria-label={f({ id: 'nextCoverage.sections' })} className={styles.tabs}>
                                {SECTIONS.map(({ id, labelId, Icon }, i) => (
                                    <button
                                        key={id}
                                        ref={(node) => {
                                            tabs.current[i] = node;
                                        }}
                                        type="button"
                                        role="tab"
                                        id={tabId(id)}
                                        aria-selected={id === section}
                                        aria-controls={panelId(id)}
                                        tabIndex={id === section ? 0 : -1}
                                        className={clx(styles.tab, id === section ? styles.selected : '')}
                                        onClick={() => setSection(id)}
                                        onKeyDown={onKeyDown}
                                    >
                                        <Icon aria-hidden="true" className={styles.tabIcon} />
                                        <span>{f({ id: labelId })}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {SECTIONS.map(({ id }) => (
                            <div
                                key={id}
                                role="tabpanel"
                                id={panelId(id)}
                                aria-labelledby={tabId(id)}
                                hidden={id !== section}
                                className={styles.panel}
                            >
                                {panels[id]}
                            </div>
                        ))}
                    </div>
                }
                footer={
                    <div className={styles.statusbar}>
                        <span>
                            {f(
                                { id: 'nextCoverage.status' },
                                { used: run.counts.used, evaluated: run.evaluated, findings: run.findings.length },
                            )}
                        </span>
                        <span>{f({ id: 'nextCoverage.checked' }, { date: checkedAt })}</span>
                    </div>
                }
            />
        </>
    );
};

export default NextCoverage;
