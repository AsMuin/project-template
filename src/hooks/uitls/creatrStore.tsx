import { createContext, useContext } from 'react';

// create store factory function
export function createStore<S>(initialStateHook: () => S) {
    // create context
    const StoreContext = createContext({} as S);

    // define provider (will be used to wrap the app)
    function StoreProvider({ children, CustomState }: { children: React.ReactNode; CustomState?: S }) {
        const initialState = initialStateHook();

        return <StoreContext.Provider value={CustomState || initialState}>{children}</StoreContext.Provider>;
    }

    // define hook (will be used in components)
    function useStore() {
        const store = useContext(StoreContext);

        if (!store) {
            throw new Error('useStore must be used within a StoreProvider');
        }

        return store;
    }

    // define withStoreProvider (will be used to wrap components)
    function withStoreProvider<T extends object>(Component: React.ComponentType<T>) {
        return function WithStoreProvider(props: T) {
            return (
                <StoreProvider>
                    <Component {...props} />
                </StoreProvider>
            );
        };
    }

    return {
        useStore,
        StoreProvider,
        withStoreProvider
    };
}
