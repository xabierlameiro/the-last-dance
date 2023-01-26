import CountDown from '..';
import { render } from '@/test';

describe('CountDown', () => {
    it('should render correctly', () => {
        render(<CountDown date="2023-05-06T00:00:00+00:00" />);
        expect(document.querySelector('.countdown')).toBeInTheDocument();
    });
});
