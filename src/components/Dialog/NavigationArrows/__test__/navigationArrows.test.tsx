import NavigationArrows from '..';
import { fireEvent, render, screen } from '@/test';

describe('NavigationArrows component', () => {
    it('Should dispatch event when click on arrow', () => {
        const onClickLeft = jest.fn();
        const onClickRight = jest.fn();

        render(
            <NavigationArrows
                onClickLeft={onClickLeft}
                onClickRight={onClickRight}
            />
        );

        fireEvent.click(screen.getByTestId('left'));
        expect(onClickLeft).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByTestId('right'));
        expect(onClickRight).toHaveBeenCalledTimes(1);
    });

    it('Should not dispatch event when click left/right arrow', () => {
        const onClickLeft = jest.fn();
        const onClickRight = jest.fn();

        render(<NavigationArrows />);

        fireEvent.click(screen.getByTestId('left'));
        expect(onClickLeft).toHaveBeenCalledTimes(0);

        fireEvent.click(screen.getByTestId('right'));
        expect(onClickRight).toHaveBeenCalledTimes(0);
    });
});
