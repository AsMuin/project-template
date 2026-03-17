import { scan } from 'react-scan';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { routeTree } from './routeTree.gen';
import '@repo/ui/styles.css';

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const isDev = import.meta.env.MODE === 'development';

if (typeof window !== 'undefined' && isDev) {
    scan({ enabled: true, log: false });
}

const queryClient = new QueryClient();

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const router = createRouter({
    routeTree,
    context: {
        queryClient
    }
});

const TanStackRouterDevtools = isDev
    ? lazy(() =>
          import('@tanstack/router-devtools').then(res => ({
              default: res.TanStackRouterDevtools
          }))
      )
    : () => null; // Render nothing in production

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);

    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <Suspense>
                    <TanStackRouterDevtools router={router} initialIsOpen={false} />
                </Suspense>
            </QueryClientProvider>
        </StrictMode>
    );
}
