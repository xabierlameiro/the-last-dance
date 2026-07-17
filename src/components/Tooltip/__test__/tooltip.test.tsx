import Tooltip from '..';
import { render, screen, fireEvent } from '@/test';

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

    // Regression for SDD-001: uncontrolled tooltips never opened because
    // useHover/useFocus were disabled by a strict `controlledOpen === null` check.
    it('should open on focus when uncontrolled', async () => {
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
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
        const trigger = screen.getByTestId('trigger').parentElement as HTMLElement;
        fireEvent.focus(trigger);
        expect(await screen.findByTestId('tooltip')).toBeInTheDocument();
    });
});
