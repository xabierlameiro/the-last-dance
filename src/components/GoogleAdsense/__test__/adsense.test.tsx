import GoogleAdsense from '..';

// This component is not rendered in development mode and it need a google script to be rendered
describe('GoogleAdsense', () => {
    it('Should renders GoogleAdsense component', () => {
        expect(() => <GoogleAdsense slot="1234567890" />).not.toThrow();
    });
});
