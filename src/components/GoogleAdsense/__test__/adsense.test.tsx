// @ts-nocheck
import GoogleAdsense from '..';
import { render } from '@/test';

// This component is not rendered in development mode and it need a google script to be rendered
describe('GoogleAdsense', () => {
    it('Should renders GoogleAdsense component', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" />);
        expect(container.querySelector('ins')).toBeInTheDocument();
    });

    it('Should renders GoogleAdsense component with horizontal prop', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" horizontal />);
        expect(container.querySelector('ins')).toBeInTheDocument();
    });

    it('Should renders GoogleAdsense component with client prop', () => {
        const { container } = render(<GoogleAdsense slot="1234567890" client="ca-pub-3537017956623483" />);
        expect(container.querySelector('ins')).toBeInTheDocument();
    });
});
