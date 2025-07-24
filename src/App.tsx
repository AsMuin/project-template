import { Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            <Toaster />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </QueryClientProvider>
    );
}

const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
        ? () => null // Render nothing in production
        : lazy(() =>
              import('@tanstack/router-devtools').then(res => ({
                  default: res.TanStackRouterDevtools
              }))
          );

export default App;
