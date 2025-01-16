import { scan } from 'react-scan';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from './router';
import './index.css';

if (typeof window !== 'undefined' && import.meta.env.MODE === 'development') {
    scan({ enabled: true, log: false });
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}></RouterProvider>
    </StrictMode>
);
