import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import MessageManager, { showMessage } from './components/MessageManager';
import useOnMounted from './hooks/lifecycle/useOnMounted';

function App() {
    useOnMounted(() => {
        setTimeout(() => {
            showMessage({
                type: 'success',
                message: 'Hello AsMuin',
                duration: 3000
            });
        }, 2000);
    });
    return (
        <>
            <div className="grid min-h-screen place-content-center bg-slate-200 text-center text-3xl text-sky-400 drop-shadow-md">
                <div className="flex flex-col gap-8">
                    <p className="duration-500 hover:scale-125 hover:text-purple-400">🎉🎉Hello AsMuin🎉🎉</p>
                    <p className="duration-500 hover:scale-125 hover:text-purple-400">There is React Project Template</p>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
            <MessageManager />
        </>
    );
}

export default App;
