import App from '@/App';
import { createBrowserRouter } from 'react-router';
const router = createBrowserRouter([
    {
        path: '*',
        Component: App,
        children: [
            {
                path: '/*',
                async lazy() {
                    const Component = await import('@/view/Demo');
                    return {
                        Component: Component.default
                    };
                }
            }
        ]
    }
]);

export default router;
