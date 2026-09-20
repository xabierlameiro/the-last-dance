import { render, screen, fireEvent, act } from '@/test';
import StarPrompt, { STAR_PROMPT_STORAGE_KEY } from '..';

/**
 * The reading surface is a panel, not the window — see the component. jsdom reports 0 for every
 * layout box, so the geometry has to be stated: these numbers stand in for the blog body, measured
 * at 2409px of content in an 800px window.
 */
const panel = (scrollHeight = 2409, clientHeight = 800) => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
    document.body.appendChild(element);
    return element;
};

const scrollTo = (element: HTMLElement, top: number) => {
    Object.defineProperty(element, 'scrollTop', { value: top, configurable: true });
    act(() => {
        element.dispatchEvent(new Event('scroll', { bubbles: false }));
    });
};

describe('StarPrompt', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.localStorage.clear();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('appears once the visitor has read most of a panel', () => {
        const body = panel();
        render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);

        scrollTo(body, 200);
        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();

        scrollTo(body, 1400);
        expect(screen.getByTestId('star-prompt')).toBeInTheDocument();
    });

    /** A flick of the wheel to the bottom is not reading, so the dwell has to hold too. */
    it('stays away when the panel was scrolled through immediately', () => {
        const body = panel();
        render(<StarPrompt />);

        scrollTo(body, 1600);

        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();
    });

    /** A short scroller is a list or a sidebar, not something that was read. */
    it('ignores scrollers too short to have been read', () => {
        const sidebar = panel(950, 800);
        render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);

        scrollTo(sidebar, 150);

        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();
    });

    it('never asks twice, even if the visitor answers nothing', () => {
        const body = panel();
        const { unmount } = render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);
        scrollTo(body, 1400);
        expect(screen.getByTestId('star-prompt')).toBeInTheDocument();
        expect(window.localStorage.getItem(STAR_PROMPT_STORAGE_KEY)).toBe('seen');
        unmount();

        render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);
        scrollTo(body, 1400);

        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();
    });

    it('records the answer and closes', () => {
        const body = panel();
        render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);
        scrollTo(body, 1400);

        fireEvent.click(screen.getByRole('button'));

        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();
        expect(window.localStorage.getItem(STAR_PROMPT_STORAGE_KEY)).toBe('dismissed');
    });

    it('closes on Escape', () => {
        const body = panel();
        render(<StarPrompt />);
        jest.setSystemTime(Date.now() + 60_000);
        scrollTo(body, 1400);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.queryByTestId('star-prompt')).not.toBeInTheDocument();
    });
});
