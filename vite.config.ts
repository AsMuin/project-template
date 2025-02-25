import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const common = { plugins: [react(), tailwindcss(), TanStackRouterVite()], resolve: { alias: { '@': resolve(__dirname, './src') } } };

    if (command === 'serve') {
        return {
            ...common,
            // dev 独有配置
            server: {
                proxy: { '/api': { target: env.VITE_BACKEND_URL, changeOrigin: true } },
                allowedHosts: ['3txwhfom-c2rj0iv3-6wcz4o8b6wah.vcd4.mcprev.cn']
            }
        };
    } else {
        // command === 'build'
        return {
            ...common
            // build 独有配置
        };
    }
});
