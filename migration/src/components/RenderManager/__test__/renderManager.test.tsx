import RenderManager from '..';
import { render, screen } from '@/test';

describe('RenderManager', () => {
    it('should render', () => {
        render(
            <RenderManager error={false} loading={false}>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('render-manager')).toBeInTheDocument();
    });

    it('should render loading', () => {
        render(
            <RenderManager error={false} loading>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render error', () => {
        render(
            <RenderManager error loading={false}>
                <div data-testid="render-manager" />
            </RenderManager>
        );
        expect(screen.getByTestId('error')).toBeInTheDocument();
    });
});
