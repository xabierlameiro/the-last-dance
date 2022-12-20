import IconWithName from '..';
import { render, screen } from '@/test';

describe('IconWithName component', () => {
    it('Should renders Controls component and dispatch events', () => {
        render(
            <IconWithName
                alt="Alt text"
                icon="/language.jpeg"
                name="Language & Region"
            />
        );
        const iconWithNameElement = screen.getByTestId('icon-with-name');
        expect(iconWithNameElement).toBeInTheDocument();
        expect(screen.getByAltText('Alt text')).toBeInTheDocument();
        expect(screen.getByText('Language & Region')).toBeInTheDocument();
    });
});
