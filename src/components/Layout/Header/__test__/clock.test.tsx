import { MessageChannel as NodeMessageChannel } from 'node:worker_threads';
import { act } from 'react';
import { IntlProvider } from 'react-intl';
import { DialogProvider } from '@/context/dialog';
import { messages } from '../../../../intl/translations';
import Header from '..';

// The suite-wide mock echoes its input, and these tests read the weekday, the day and the month the
// clock wrote. Only the real formatter writes them.
jest.mock('react-intl', () => jest.requireActual('react-intl'));

// `react-dom/server` resolves to its browser build under jsdom, and that build schedules through
// `MessageChannel`, which jsdom does not implement. Assigned here rather than in `jest.env.setup.js`
// because this is the only suite that server-renders; the other 87 have no use for it. It has to
// land before `react-dom/server` is loaded, which is why the two react-dom imports below are
// dynamic — static imports are hoisted above this line.
//
// Every channel is tracked so `afterAll` can close it. Node's real `MessageChannel` holds the event
// loop open, React's scheduler creates one when the module loads and never closes it, and `unref()`
// alone does not satisfy Jest's handle detector — the run still ends on "Jest did not exit one
// second after the test run has completed", which is a hanging worker in CI rather than a warning.
const openChannels: NodeMessageChannel[] = [];

class TrackedMessageChannel extends NodeMessageChannel {
    constructor() {
        super();
        openChannels.push(this);
    }
}

(globalThis as unknown as { MessageChannel: unknown }).MessageChannel = TrackedMessageChannel;

jest.mock('@/components/CryptoPrice', () => {
    const CryptoPrice = () => <div />;
    CryptoPrice.displayName = 'CryptoPrice';
    return CryptoPrice;
});

/**
 * The header clock, exercised the only way that can see the defect it had: server-render at one
 * instant, hydrate at another.
 *
 * `render()` from testing-library cannot catch this. It mounts on an empty container, so the text
 * it produces is the client's by construction and the test passes whatever the component does. The
 * pages here are statically generated, so the interesting gap is between the moment the HTML was
 * built and the moment a visitor loads it — days or weeks, not milliseconds.
 *
 * The bug: the four fields carried `suppressHydrationWarning`, which tells React to keep the
 * server's text and skip the DOM patch. After that React only rewrites a node whose value differs
 * from the PREVIOUS CLIENT RENDER, and the weekday, day and month are stable between one render and
 * the next, so the build's date stayed on screen until midnight — days late on a static page. The
 * time recovered on its own because the 60 s interval changes it.
 */

const BUILD_TIME = new Date('2025-12-14T21:07:00.000Z');
const VISIT_TIME = new Date('2026-01-15T10:30:00.000Z');

/** The four spans the clock renders, in order: weekday, day, month, time. */
function clockFields(container: HTMLElement): string[] {
    const clock = container.querySelector('.dateAndHour');
    if (!clock) throw new Error('no clock in the header');

    return [...clock.children].map((child) => child.textContent ?? '');
}

/** Held so `afterEach` can unmount it: the clock's interval keeps the process alive otherwise. */
let hydrated: { unmount: () => void } | null = null;

async function renderAtBuildThenHydrateAtVisit(): Promise<string[]> {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');

    const tree = (
        <IntlProvider locale="en" messages={messages.en}>
            <DialogProvider>
                <Header />
            </DialogProvider>
        </IntlProvider>
    );

    jest.setSystemTime(BUILD_TIME);
    const serverHtml = renderToString(tree);

    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    // Guards the assertions below against a component that renders no clock at all: they are
    // written as "the visitor's value is present, the build's is not", and an empty header would
    // satisfy the second half on its own.
    expect(clockFields(container)).toHaveLength(4);

    jest.setSystemTime(VISIT_TIME);
    await act(async () => {
        hydrated = hydrateRoot(container, tree);
    });

    return clockFields(container);
}

describe('Header clock', () => {
    beforeEach(() => {
        // Only `Date` is faked. Faking the timers too hangs the suite: React's scheduler drives
        // hydration through `setTimeout`, so a fake clock that nobody advances leaves `act` waiting
        // for work that can never run. Nothing here needs to move time forward anyway — the defect
        // lives in the gap between the server render and the hydration, not in the 60 s interval.
        jest.useFakeTimers({
            doNotFake: [
                'hrtime',
                'nextTick',
                'performance',
                'queueMicrotask',
                'requestAnimationFrame',
                'cancelAnimationFrame',
                'requestIdleCallback',
                'cancelIdleCallback',
                'setImmediate',
                'clearImmediate',
                'setInterval',
                'clearInterval',
                'setTimeout',
                'clearTimeout',
            ],
        });
    });

    afterEach(() => {
        act(() => hydrated?.unmount());
        hydrated = null;
        jest.useRealTimers();
        document.body.innerHTML = '';
    });

    afterAll(() => {
        for (const channel of openChannels) {
            channel.port1.close();
            channel.port2.close();
        }
    });

    it('should show the visitor date after hydration, not the date the page was built', async () => {
        const fields = await renderAtBuildThenHydrateAtVisit();

        expect(fields).toContain('15');
        expect(fields).not.toContain('14');
    });

    it('should render no date on the server, so hydration has nothing to disagree with', async () => {
        const { renderToString } = await import('react-dom/server');

        jest.setSystemTime(BUILD_TIME);
        const container = document.createElement('div');
        container.innerHTML = renderToString(
            <IntlProvider locale="en" messages={messages.en}>
                <DialogProvider>
                    <Header />
                </DialogProvider>
            </IntlProvider>
        );

        // The mechanism the fix rests on: an empty clock server-side means the first client render
        // matches it, which is what makes `suppressHydrationWarning` unnecessary. Leave a value
        // here and the old defect comes straight back, because React would keep this text.
        expect(clockFields(container)).toEqual(['', '', '', '']);
    });

    it('should show the visitor month after hydration, not the month the page was built', async () => {
        const fields = await renderAtBuildThenHydrateAtVisit();

        // en-US short months for the two instants. Asserting on both directions rather than on the
        // exact string keeps this readable if the locale data shifts `Dec`/`Jan` spelling.
        expect(fields.join(' ')).toMatch(/Jan/);
        expect(fields.join(' ')).not.toMatch(/Dec/);
    });
});
