// @ts-nocheck
import { render, screen } from '@/test';
import StarCounter from '..';
import useGithubStars from '@/hooks/useGithubStars';

// Mock the useGithubStars hook
jest.mock('@/hooks/useGithubStars');
const mockUseGithubStars = useGithubStars as jest.MockedFunction<typeof useGithubStars>;

describe('StarCounter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the success render', () => {
        mockUseGithubStars.mockReturnValue({
            data: 22,
            error: false,
            loading: false,
        });
        
        render(<StarCounter />);
        expect(screen.getByTestId('star-counter')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('should render the error render', () => {
        mockUseGithubStars.mockReturnValue({
            data: null,
            error: true,
            loading: false,
        });
        
        render(<StarCounter />);
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('should render the loading render', () => {
        mockUseGithubStars.mockReturnValue({
            data: null,
            error: false,
            loading: true,
        });
        
        render(<StarCounter />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
