import CookieConsent, { CONSENT_STORAGE_KEY } from '..';
import { fireEvent, render, screen } from '@/test';

describe('CookieConsent', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.gtag = jest.fn();
    });

    it('asks when the visitor has not answered yet', () => {
        render(<CookieConsent />);
        expect(screen.getByTestId('consent-accept')).toBeInTheDocument();
        expect(screen.getByTestId('consent-reject')).toBeInTheDocument();
    });

    it('stays out of the way once an answer is stored', () => {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
        render(<CookieConsent />);
        expect(screen.queryByTestId('consent-accept')).not.toBeInTheDocument();
    });

    it('grants every identifying signal when accepted, and remembers it', () => {
        render(<CookieConsent />);
        fireEvent.click(screen.getByTestId('consent-accept'));

        expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
        expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        });
        expect(screen.queryByTestId('consent-accept')).not.toBeInTheDocument();
    });

    it('keeps every identifying signal denied when rejected, and remembers it', () => {
        render(<CookieConsent />);
        fireEvent.click(screen.getByTestId('consent-reject'));

        expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
        expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        });
    });

    // Escape must mean "no", never "yes" by omission: the default state is already denied, and a
    // notification the keyboard cannot dismiss is a trap.
    it('answers denied on Escape', () => {
        render(<CookieConsent />);
        fireEvent.keyDown(window, { key: 'Escape' });

        expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
        expect(screen.queryByTestId('consent-accept')).not.toBeInTheDocument();
    });

    // Regression guard. `role="dialog"` + `aria-live` on one node is invalid — a dialog is a window,
    // not a live region — and made some screen readers announce the subtree as an atomic update while
    // also reporting a dialog.
    it('is a named dialog, not a live region', () => {
        render(<CookieConsent />);
        const dialog = screen.getByRole('dialog');

        expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title');
        expect(dialog).not.toHaveAttribute('aria-live');
        // Non-modal on purpose: it is a notification beside the page, so focus is not trapped.
        expect(dialog).not.toHaveAttribute('aria-modal');
    });

    // It used to be a full-width bar at `bottom: 0`, directly over the Dock — the only navigation
    // this site has — intercepting clicks on it until answered.
    it('does not render as a bottom-anchored full-width bar', () => {
        render(<CookieConsent />);
        expect(screen.getByRole('dialog').className).not.toMatch(/banner/);
    });

    it('does not ask when there is nowhere to record the answer', () => {
        // Private mode and cookie-blocking extensions make getItem throw. Asking on
        // every page load would be worse than staying on the denied defaults.
        const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('storage disabled');
        });

        render(<CookieConsent />);
        expect(screen.queryByTestId('consent-accept')).not.toBeInTheDocument();

        getItem.mockRestore();
    });
});
