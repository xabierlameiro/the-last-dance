import { useDialog } from '@/context/dialog';
import { default as CButtons } from '@/components/ControlButtons';
// @ts-ignore
import { CH } from '@xabierlameiro/code-hike/dist/components.cjs.js';

export const ControlButtons = () => {
    const { dispatch } = useDialog();
    return (
        <CButtons
            disabled
            withPadding
            onClickClose={() => dispatch({ type: 'close' })}
            onClickMinimise={() => dispatch({ type: 'close' })}
        />
    );
};

export const components = { CH, ControlButtons };
