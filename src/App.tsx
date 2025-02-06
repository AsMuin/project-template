import { Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';

function App() {
    return (
        <>
            <Outlet />
            <Toaster />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </>
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
