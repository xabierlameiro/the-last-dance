import GoogleAdsense from '..';

describe('GoogleAdsense', () => {
    process.env = { NODE_ENV: 'production' };

    it('Should renders GoogleAdsense component', () => {
        expect(() => <GoogleAdsense slot="1234567890" />).not.toThrow();
    });

    it('Should renders GoogleAdsense component with horizontal prop', () => {
        expect(() => <GoogleAdsense slot="1234567890" horizontal />).not.toThrow();
    });

    it('Should renders GoogleAdsense component with client prop', () => {
        expect(() => <GoogleAdsense slot="1234567890" client="1234567890" />).not.toThrow();
    });
});
