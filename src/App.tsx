import { Suspense } from 'react';
import { Outlet } from 'react-router';
import MessageManager from './components/MessageManager';

function App() {

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
            <MessageManager />
        </>
    );
}

export default App;
