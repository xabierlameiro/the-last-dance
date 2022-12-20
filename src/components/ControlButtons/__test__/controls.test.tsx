import Controls from '..';
import { fireEvent, render, screen } from '@/test';

describe('Controls component', () => {
    it('Should renders Controls component and dispatch events', () => {
        const onClickClose = jest.fn();
        const onClickMinimise = jest.fn();
        const onClickMaximise = jest.fn();

        render(
            <Controls
                onClickClose={onClickClose}
                onClickMinimise={onClickMinimise}
                onClickMaximise={onClickMaximise}
            />
        );
        const controlsElement = screen.getByTestId('controls');
        expect(controlsElement).toBeInTheDocument();
        fireEvent.click(screen.getByTitle('Close'));
        expect(onClickClose).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByTitle('Minimise'));
        expect(onClickClose).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByTitle('Maximise'));
        expect(onClickClose).toHaveBeenCalledTimes(1);
    });
});
