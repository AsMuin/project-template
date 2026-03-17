import { createRootRoute, Outlet } from '@tanstack/react-router';

function RootComponent() {
    return (
        <div className="bg-background relative min-h-screen overflow-hidden">
            <Outlet />
        </div>
    );
}

export const Route = createRootRoute({
    component: RootComponent
});
