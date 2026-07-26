import * as React from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useFocus,
    useDismiss,
    useRole,
    useInteractions,
    useMergeRefs,
    FloatingPortal,
} from '@floating-ui/react';
import styles from './tooltip.module.css';
import type { Placement } from '@floating-ui/react';

interface TooltipOptions {
    initialOpen?: boolean;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

function useTooltip({
    initialOpen = false,
    placement = 'top',
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: TooltipOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                fallbackAxisSideDirection: 'start',
            }),
            shift({ padding: 5 }),
        ],
    });

    const context = data.context;

    const hover = useHover(context, {
        move: false,
        // == null: uncontrolled usage passes undefined, and strict === null kept these disabled
        enabled: controlledOpen == null,
    });
    const focus = useFocus(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'tooltip' });

    const interactions = useInteractions([hover, focus, dismiss, role]);

    return React.useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
        }),
        [open, setOpen, interactions, data],
    );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

const useTooltipContext = () => {
    const context = React.useContext(TooltipContext);

    if (context === null) {
        throw new Error('Tooltip components must be wrapped in <Tooltip />');
    }

    return context;
};

function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const tooltip = useTooltip(options);
    return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & { asChild?: boolean }>(
    function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
        const context = useTooltipContext();
        // SDD-L11-T10. This line used to cast `children` to bypass the type system and read
        // `.ref` off it — the last such cast in src/ — and it was hiding a real deprecation rather
        // than merely a missing type. React 19 removed `element.ref` and logs "Accessing
        // element.ref was removed in React 19. ref is now a regular prop" every time this runs;
        // `@types/react@19` dropped `ref` from `ReactElement` for the same reason, which is what
        // made the cast necessary. Verified under react@19.1.0 that the element and the prop hold
        // the same ref today, so reading it where it now lives keeps the merge below working and
        // stops the warning. `null` rather than `undefined`: `useMergeRefs` takes `React.Ref`,
        // which includes the first and not the second.
        const childrenRef = React.isValidElement<{ ref?: React.Ref<HTMLElement> }>(children)
            ? (children.props.ref ?? null)
            : null;
        const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

        // `asChild` allows the user to pass any element as the anchor
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(
                children,
                context.getReferenceProps({
                    ref,
                    ...props,
                    ...(children.props || {}),
                    'data-state': context.open ? 'open' : 'closed',
                } as React.HTMLProps<Element>),
            );
        }

        return (
            <span
                ref={ref}
                // The user can style the trigger based on the state
                data-state={context.open ? 'open' : 'closed'}
                {...context.getReferenceProps(props)}
            >
                {children}
            </span>
        );
    },
);

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
    function TooltipContent(props, propRef) {
        const context = useTooltipContext();
        const ref = useMergeRefs([context.refs.setFloating, propRef]);

        return (
            <FloatingPortal>
                {context.open && (
                    <div
                        className={styles.tooltip}
                        ref={ref}
                        style={{
                            position: context.strategy,
                            top: context.y ?? 0,
                            left: context.x ?? 0,
                            visibility: context.x === null ? 'hidden' : 'visible',
                            ...props.style,
                        }}
                        {...context.getFloatingProps(props)}
                    />
                )}
            </FloatingPortal>
        );
    },
);

Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

export default Tooltip;
