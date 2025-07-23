import DeploymentStatus from '..';
import { render, screen } from '@/test';
import useSWR from 'swr';

jest.mock('swr');

const mockData = {
    status: 'ready',
    username: 'test',
    environment: 'prod',
    createdAt: new Date().toISOString(),
};

describe('DeploymentStatus component', () => {
    it('renders status indicator', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: mockData, error: false });
        const { container } = render(<DeploymentStatus />);
        expect(container.querySelector('.status')).toBeInTheDocument();
    });

    it('renders error state', () => {
        (useSWR as jest.Mock).mockReturnValue({ data: undefined, error: true });
        render(<DeploymentStatus />);
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });
});
