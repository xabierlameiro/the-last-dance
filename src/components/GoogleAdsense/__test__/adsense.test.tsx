// @ts-nocheck
import GoogleAdsense from '..';
import { render } from '@/test';

// AdSense is temporarily disabled (ADSENSE_ENABLED = false), so the component
// renders nothing until the ads are serving again.
describe('GoogleAdsense', () => {
    it('Should render nothing while AdSense is disabled', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" />);
        expect(container.querySelector('ins')).not.toBeInTheDocument();
    });

    it('Should render nothing with horizontal prop while disabled', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" horizontal />);
        expect(container.querySelector('ins')).not.toBeInTheDocument();
    });

    it('Should render nothing with client prop while disabled', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" client="ca-pub-3537017956623483" />);
        expect(container.querySelector('ins')).not.toBeInTheDocument();
    });
});
