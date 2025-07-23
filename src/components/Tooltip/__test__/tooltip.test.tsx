import Tooltip from '..';
import { render, screen } from '@/test';

describe('Tooltip', () => {
    it('should render', () => {
        render(
            <Tooltip>
                <Tooltip.Trigger>
                    <div data-testid="trigger" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <div data-testid="tooltip" />
                </Tooltip.Content>
            </Tooltip>
        );
        expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('should render tooltip', () => {
        render(
            <Tooltip initialOpen>
                <Tooltip.Trigger>
                    <div data-testid="trigger" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <div data-testid="tooltip" />
                </Tooltip.Content>
            </Tooltip>
        );
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
});
