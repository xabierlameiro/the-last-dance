import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
    BsActivity,
    BsBoxArrowUpRight,
    BsBug,
    BsCheck2,
    BsClipboard,
    BsEyeSlash,
    BsHammer,
    BsListUl,
} from 'react-icons/bs';
import SEO from '@/components/SEO';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { softwareApplicationJsonLd } from '@/components/SEO/jsonLd';
import { clx } from '@/helpers';
import { nextLeak, nextJsIssueUrl, VERDICTS, type IssueRow, type RouteResult } from '@/constants/nextLeak';
import styles from '@/styles/next-leak.module.css';

const SECTIONS = [
    { id: 'overview', labelId: 'nextLeak.nav.overview', Icon: BsListUl },
    { id: 'run', labelId: 'nextLeak.nav.run', Icon: BsActivity },
    { id: 'build', labelId: 'nextLeak.nav.build', Icon: BsHammer },
    { id: 'verified', labelId: 'nextLeak.nav.verified', Icon: BsBug },
    { id: 'limits', labelId: 'nextLeak.nav.limits', Icon: BsEyeSlash },
    { id: 'links', labelId: 'nextLeak.nav.links', Icon: BsBoxArrowUpRight },
] as const;

type Section = (typeof SECTIONS)[number]['id'];

const tabId = (section: Section) => `next-leak-tab-${section}`;
const panelId = (section: Section) => `next-leak-panel-${section}`;

const mb = (value: number) => value.toFixed(1);
const first = (samples: number[]) => samples[0] ?? 0;
const last = (samples: number[]) => samples.at(-1) ?? 0;

// Inline code inside translated copy: flags and config keys stay as the CLI prints them.
const code = (chunks: React.ReactNode) => <code className={styles.code}>{chunks}</code>;

const issueLink = (issue: number) => <a href={nextJsIssueUrl(issue)}>{`#${issue}`}</a>;

/**
 * The chart's y axis starts at zero, not at the smallest sample. Scaled to the samples' own range, a
 * route that moves 0.8 MB fills the box exactly like one that moves 110 MB, and a stable route would
 * read as a leak. Every value it draws is also in the table beside it, so the SVG is aria-hidden.
 */
const CHART = { left: 4, right: 396, base: 116, top: 12 };

const stepPoints = (samples: number[]) => {
    const max = Math.max(...samples) * 1.05;
    const step = (CHART.right - CHART.left) / samples.length;
    const y = (value: number) => (CHART.base - (value / max) * (CHART.base - CHART.top)).toFixed(1);
    return samples
        .flatMap((value, i) => {
            const x = CHART.left + i * step;
            return [`${x.toFixed(1)},${y(value)}`, `${(x + step).toFixed(1)},${y(value)}`];
        })
        .join(' ');
};

// Three samples per row, the way the design lays out the nine cycles of the leaking route.
const cycleRows = (samples: number[]) => {
    const rows: { label: string; values: string }[] = [];
    for (let i = 0; i < samples.length; i += 3) {
        const part = samples.slice(i, i + 3);
        const last = i + part.length;
        rows.push({
            label: part.length === 1 ? `${last}` : `${i + 1}–${last}`,
            values: part.map(mb).join(' · '),
        });
    }
    return rows;
};

const Verdict = ({ verdict }: { verdict: RouteResult['verdict'] }) => (
    <span className={clx(styles.verdict, styles[verdict])}>{verdict}</span>
);

const Titlebar = () => {
    const { formatMessage: f, locale } = useIntl();
    const router = useRouter();
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) return undefined;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    // Same exit as /settings: a client-side push that keeps the visitor's language.
    const close = () => {
        router.push('/', '/', { locale: router.locale ?? locale });
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(nextLeak.install);
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
                    <span className={styles.appTitle}>next-leak</span>
                    <span className={styles.appVersion}>{`${nextLeak.version} · CLI`}</span>
                </div>
                <div className={styles.install}>
                    <code className={styles.command}>{nextLeak.install}</code>
                    <button
                        type="button"
                        className={styles.copyButton}
                        onClick={copy}
                        aria-label={f({ id: 'nextLeak.copyLabel' }, { command: nextLeak.install })}
                    >
                        {copied ? (
                            <BsCheck2 aria-hidden="true" className={styles.copyIcon} />
                        ) : (
                            <BsClipboard aria-hidden="true" className={styles.copyIcon} />
                        )}
                        <span aria-live="polite">{f({ id: copied ? 'nextLeak.copied' : 'nextLeak.copy' })}</span>
                    </button>
                </div>
            </div>
            <p className={styles.pitch}>{f({ id: 'nextLeak.pitch' })}</p>
        </div>
    );
};

const Overview = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextLeak.overview.title' })}</h2>
            <ol>
                <li>{f({ id: 'nextLeak.overview.answer1' })}</li>
                <li>{f({ id: 'nextLeak.overview.answer2' })}</li>
                <li>{f({ id: 'nextLeak.overview.answer3' })}</li>
                <li>{f({ id: 'nextLeak.overview.answer4' })}</li>
            </ol>

            <h2>{f({ id: 'nextLeak.overview.start' })}</h2>
            <p>{f({ id: 'nextLeak.overview.startText' }, { code })}</p>
            <pre className={styles.block}>{`next build\n${nextLeak.install}`}</pre>

            <h2>{f({ id: 'nextLeak.overview.how' })}</h2>
            <p>{f({ id: 'nextLeak.overview.howText' })}</p>
            <pre className={styles.block}>{nextLeak.ritual}</pre>
            <p>{f({ id: 'nextLeak.overview.shape' })}</p>

            <h2>{f({ id: 'nextLeak.overview.verdicts' })}</h2>
            <dl className={styles.verdicts}>
                {VERDICTS.map((verdict) => (
                    <React.Fragment key={verdict}>
                        <dt>
                            <Verdict verdict={verdict} />
                        </dt>
                        <dd>{f({ id: `nextLeak.verdict.${verdict}` })}</dd>
                    </React.Fragment>
                ))}
            </dl>
            <p className={styles.note}>
                {f({ id: 'nextLeak.overview.falsePositives' }, { routes: nextLeak.healthyRoutes })}
            </p>
        </div>
    );
};

const Chart = ({ route }: { route: RouteResult }) => {
    const { formatMessage: f } = useIntl();
    const line = stepPoints(route.samples);

    return (
        <figure className={styles.chartFigure}>
            <figcaption className={styles.chartCaption}>
                <span>{f({ id: 'nextLeak.run.chart' })}</span>
                <span>{`${mb(Math.max(...route.samples))} MB`}</span>
            </figcaption>
            <svg
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                aria-hidden="true"
                className={clx(styles.chart, route.verdict === 'leak' ? styles.chartLeak : styles.chartStable)}
            >
                {[30, 60, 90].map((y) => (
                    <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="400"
                        y2={y}
                        className={styles.gridline}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
                <polygon
                    className={styles.chartArea}
                    points={`${CHART.left},${CHART.base} ${line} ${CHART.right},${CHART.base}`}
                />
                <polyline className={styles.chartLine} points={line} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className={styles.chartAxis}>
                <span>{f({ id: 'nextLeak.run.cycle' }, { n: 1, mb: mb(first(route.samples)) })}</span>
                <span>{f({ id: 'nextLeak.run.cycle' }, { n: route.samples.length, mb: mb(last(route.samples)) })}</span>
            </div>
        </figure>
    );
};

const Run = () => {
    const { formatMessage: f } = useIntl();
    const { routes, issue, fixedIn } = nextLeak.exampleRun;
    const [selected, setSelected] = React.useState(0);
    const route = routes[selected];
    if (!route) return null;
    const isLeak = route.verdict === 'leak';

    return (
        <div className={styles.run}>
            <h2 className="visuallyHidden">{f({ id: 'nextLeak.nav.run' })}</h2>
            <div>
                <div className={styles.routesHead} aria-hidden="true">
                    <span>{f({ id: 'nextLeak.table.route' })}</span>
                    <span>{f({ id: 'nextLeak.table.verdict' })}</span>
                    <span className={styles.alignRight}>{f({ id: 'nextLeak.table.slope' })}</span>
                    <span className={styles.alignRight}>{f({ id: 'nextLeak.table.heap' })}</span>
                    <span className={styles.alignRight}>{f({ id: 'nextLeak.table.retainer' })}</span>
                </div>
                {routes.map((row, i) => (
                    <button
                        key={row.route}
                        type="button"
                        className={clx(styles.routeRow, i === selected ? styles.selected : '')}
                        aria-pressed={i === selected}
                        onClick={() => setSelected(i)}
                    >
                        <span className={styles.route}>{row.route}</span>
                        <span>
                            <Verdict verdict={row.verdict} />
                        </span>
                        <span
                            className={clx(
                                styles.alignRight,
                                styles.slope,
                                row.verdict === 'leak' ? styles.leakText : '',
                            )}
                        >
                            {row.slope}
                        </span>
                        <span className={clx(styles.alignRight, styles.heap)}>
                            {`${mb(first(row.samples))} → ${mb(last(row.samples))} MB`}
                        </span>
                        <span className={clx(styles.alignRight, styles.retainerCell, row.holder ? '' : styles.empty)}>
                            {row.holder ?? '—'}
                        </span>
                    </button>
                ))}
            </div>

            <div className={styles.detail}>
                <p className={styles.detailTitle}>
                    {f(
                        { id: 'nextLeak.run.detail' },
                        { route: route.route, issue: issueLink(issue), version: fixedIn },
                    )}
                </p>
                <div className={styles.pane}>
                    <Chart route={route} />
                    <div className={styles.paneSide}>
                        <table className={styles.cycles}>
                            <caption className={styles.paneLabel}>{f({ id: 'nextLeak.run.cycles' })}</caption>
                            <tbody>
                                {cycleRows(route.samples).map((row) => (
                                    <tr key={row.label}>
                                        <th scope="row">{row.label}</th>
                                        <td>{row.values}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <th scope="row">{f({ id: 'nextLeak.table.slope' })}</th>
                                    <td className={isLeak ? styles.leakText : ''}>{route.slope}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className={styles.retainer}>
                            <p className={styles.paneLabel}>{f({ id: 'nextLeak.table.retainer' })}</p>
                            {route.retainer ? (
                                <p className={styles.retainerChain}>{route.retainer}</p>
                            ) : (
                                <p className={styles.retainerNote}>
                                    {f({ id: 'nextLeak.run.stableRetainer' }, { code })}
                                </p>
                            )}
                        </div>
                        <p className={styles.aside}>
                            {f({ id: isLeak ? 'nextLeak.run.leakAside' : 'nextLeak.run.stableAside' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Build = () => {
    const { formatMessage: f } = useIntl();
    const { issue, pages, leaking, healthy, parent } = nextLeak.build;
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextLeak.build.title' })}</h2>
            <pre className={styles.block}>{nextLeak.buildCommand}</pre>
            <p>{f({ id: 'nextLeak.build.text' })}</p>
            <table className={styles.buildTable}>
                <caption>{f({ id: 'nextLeak.build.evidence' }, { issue: issueLink(issue), pages })}</caption>
                <tbody>
                    <tr>
                        <th scope="row">{`Next ${leaking.version}`}</th>
                        <td>
                            <Verdict verdict="leak" />
                        </td>
                        <td>
                            {f(
                                { id: 'nextLeak.build.leaking' },
                                { first: leaking.runs[0], second: leaking.runs[1], pages },
                            )}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">{`Next ${healthy.version}`}</th>
                        <td />
                        <td>{f({ id: 'nextLeak.build.healthy' }, { perPage: healthy.perPage })}</td>
                    </tr>
                </tbody>
            </table>
            <p className={styles.note}>
                {f({ id: 'nextLeak.build.fixed' }, { version: leaking.fixedIn, issue: issueLink(leaking.sameFixAs) })}
            </p>
            <p>{f({ id: 'nextLeak.build.parent' }, { from: parent.from, to: parent.to })}</p>
            <p>{f({ id: 'nextLeak.build.attribute' }, { code })}</p>
        </div>
    );
};

const IssueState = ({ state }: { state: IssueRow['state'] }) => {
    const { formatMessage: f } = useIntl();
    if (state.kind === 'fixed') return <>{f({ id: 'nextLeak.state.fixed' }, { version: state.version })}</>;
    if (state.kind === 'closed') return <>{f({ id: 'nextLeak.state.closed' })}</>;
    return (
        <>
            <strong>{f({ id: 'nextLeak.state.open' })}</strong>
            {state.fixProposed && (
                <>
                    {' · '}
                    {f(
                        { id: 'nextLeak.state.fixProposed' },
                        { link: <a href={state.fixProposed.url}>{state.fixProposed.label}</a> },
                    )}
                </>
            )}
        </>
    );
};

const Verified = ({ checkedAt }: { checkedAt: string }) => {
    const { formatMessage: f } = useIntl();
    const { issue, proof } = nextLeak.exampleRun;
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextLeak.verified.title' })}</h2>
            <p>{f({ id: 'nextLeak.verified.checked' }, { date: checkedAt })}</p>
            <div className={styles.tableScroll}>
                <table className={styles.issues}>
                    <thead>
                        <tr>
                            <th scope="col">{f({ id: 'nextLeak.verified.issue' })}</th>
                            <th scope="col">{f({ id: 'nextLeak.verified.what' })}</th>
                            <th scope="col">{f({ id: 'nextLeak.verified.measured' })}</th>
                            <th scope="col">{f({ id: 'nextLeak.verified.state' })}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nextLeak.issues.map((row) => (
                            <tr key={row.issue}>
                                <th scope="row">{issueLink(row.issue)}</th>
                                <td>{row.what}</td>
                                <td className={styles.mono}>{row.measured}</td>
                                <td>
                                    <IssueState state={row.state} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p>
                {f(
                    { id: 'nextLeak.verified.proof' },
                    {
                        issue: issueLink(issue),
                        found: proof.found,
                        cycles: proof.cycles,
                        workaround: code(proof.workaround),
                        after: proof.after,
                    },
                )}
            </p>
            <p>{f({ id: 'nextLeak.verified.kept' })}</p>
            <p>
                <a href={nextLeak.readme}>{f({ id: 'nextLeak.verified.full' })}</a>
            </p>
        </div>
    );
};

const Limits = () => {
    const { formatMessage: f } = useIntl();
    const items = ['supported', 'stable', 'heapCap', 'duration', 'attribution', 'flip', 'environment'];
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextLeak.limits.title' })}</h2>
            <ul>
                {items.map((item) => (
                    <li key={item}>{f({ id: `nextLeak.limits.${item}` }, { code })}</li>
                ))}
            </ul>
        </div>
    );
};

const Links = () => {
    const { formatMessage: f, locale } = useIntl();
    const post = nextLeak.post[locale === 'es' || locale === 'gl' ? locale : 'en'];
    return (
        <div className={styles.prose}>
            <h2>{f({ id: 'nextLeak.nav.links' })}</h2>
            <ul className={styles.links}>
                <li>
                    <a href={nextLeak.repository}>github.com/xabierlameiro/next-leak</a>
                    <span>{f({ id: 'nextLeak.links.repository' })}</span>
                </li>
                <li>
                    <a href={nextLeak.npm}>npmjs.com/package/next-leak</a>
                    <span>{f({ id: 'nextLeak.links.npm' })}</span>
                </li>
                <li>
                    <Link href={post.href}>{post.title}</Link>
                    <span>{f({ id: 'nextLeak.links.post' })}</span>
                </li>
                <li>
                    <a href={nextLeak.newIssue}>{f({ id: 'nextLeak.links.report' })}</a>
                </li>
            </ul>
        </div>
    );
};

const NextLeak = () => {
    const { formatMessage: f, formatDate } = useIntl();
    const [section, setSection] = React.useState<Section>('run');
    const tabs = React.useRef<Array<HTMLButtonElement | null>>([]);

    // UTC so the server and the browser agree on the day and hydration does not mismatch.
    const checkedAt = formatDate(nextLeak.checkedAt, { dateStyle: 'medium', timeZone: 'UTC' });
    const routes = nextLeak.exampleRun.routes;
    const leaks = routes.filter(({ verdict }) => verdict === 'leak').length;

    // WAI-ARIA tabs: arrows move and select, Home/End jump. The list is vertical on desktop and
    // horizontal on a phone, so both axes move.
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
        build: <Build />,
        verified: <Verified checkedAt={checkedAt} />,
        limits: <Limits />,
        links: <Links />,
    };

    return (
        <>
            <SEO
                meta={{
                    title: f({ id: 'nextLeak.seo.title' }),
                    description: f({ id: 'nextLeak.seo.description' }),
                }}
                jsonLd={({ url, domain, author }) =>
                    softwareApplicationJsonLd({
                        name: 'next-leak',
                        description: f({ id: 'nextLeak.seo.description' }),
                        url,
                        version: nextLeak.version,
                        operatingSystem: 'Linux, macOS',
                        requirements: 'Node.js 22 or later',
                        sameAs: [nextLeak.repository, nextLeak.npm],
                        author,
                        domain,
                    })
                }
            />

            {/* The window chrome is the visual title, as on /comments. */}
            <h1 className="visuallyHidden">{f({ id: 'nextLeak.seo.title' })}</h1>
            <Dialog
                open
                modalMode
                large
                label="next-leak"
                header={<Titlebar />}
                body={
                    <div className={styles.body}>
                        <div className={styles.sidebar}>
                            <p className={styles.sidebarTitle} aria-hidden="true">
                                {f({ id: 'nextLeak.sections' })}
                            </p>
                            {/* Content first: every panel is in the server HTML, inactive ones
                                `hidden`, so crawlers and no-JS readers get all six sections. */}
                            <div role="tablist" aria-label={f({ id: 'nextLeak.sections' })} className={styles.tabs}>
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
                        <span>{f({ id: 'nextLeak.status' }, { routes: routes.length, leaks })}</span>
                        <span>{f({ id: 'nextLeak.checked' }, { date: checkedAt })}</span>
                    </div>
                }
            />
        </>
    );
};

export default NextLeak;
