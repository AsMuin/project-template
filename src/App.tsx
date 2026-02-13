import { Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

function App() {
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    );
}

export default App;
