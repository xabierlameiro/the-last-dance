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
