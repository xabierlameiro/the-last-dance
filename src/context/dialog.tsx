import * as React from 'react';
type ContextProviderProps = { children: React.ReactNode };
type StateContextType = { state: State; dispatch: Dispatch } | undefined;
type Dispatch = (action: Action) => void;
type Action = {
    type: 'alternate' | 'open' | 'close';
};
type State = {
    open: boolean;
};

const defaultValues = {
    open: true,
};

const DialogStateContext = React.createContext<StateContextType>(undefined);

const dialogReducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'alternate':
            return {
                ...state,
                open: !state.open,
            };
        case 'open':
            return {
                ...state,
                open: true,
            };
        case 'close':
            return {
                ...state,
                open: false,
            };
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
};

const DialogProvider = ({ children }: ContextProviderProps) => {
    const [state, dispatch] = React.useReducer(dialogReducer, defaultValues);
    const value = { state, dispatch };
    return (
        <DialogStateContext.Provider value={value}>
            {children}
        </DialogStateContext.Provider>
    );
};

const useDialog = () => {
    const context = React.useContext(DialogStateContext);

    if (context === undefined) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    const dialog = (dispatch: (arg0: State, arg1: Dispatch) => void) => {
        dispatch(context.state, context.dispatch);
    };

    return { ...context.state, dispatch: context.dispatch, dialog };
};

export { DialogProvider, useDialog };
