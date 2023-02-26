import Avatar from '..';
import { render, screen } from '@/test';

describe('Avatar component', () => {
    it('Should render img, name and description', () => {
        render(
            <Avatar
                alt="Alternative text"
                img="/settings/avatar.png"
                name="Xabier Lameiro Cardama"
                description="ID of Apple"
            />
        );
        expect(screen.getByTestId('avatar')).toBeInTheDocument();
        expect(screen.getByText('Xabier Lameiro Cardama')).toBeInTheDocument();
        expect(screen.getByText('ID of Apple')).toBeInTheDocument();
        expect(screen.getByAltText('Alternative text')).toBeInTheDocument();
    });
});
