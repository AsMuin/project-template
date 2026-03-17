import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    console.log('env', env);
    const common = {
        plugins: [
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler']
                }
            }),
            tailwindcss(),
            tanstackRouter()
        ],
        resolve: { alias: { '@': resolve(__dirname, './src'), '@env': resolve(__dirname, './envConfig.ts') } }
    };

    if (command === 'serve') {
        return {
            ...common,
            server: {
                proxy: {
                    '/api': {
                        target: 'http://localhost:3001',
                        changeOrigin: true
                    },
                    '/socket.io': {
                        target: 'http://localhost:3001',
                        ws: true
                    }
                }
            }
            // dev 独有配置
            // server: {
            //     proxy: { '/api': { target: 'http://192.168.124.67:3222', changeOrigin: true } },
            //     allowedHosts: ['3txwhfom-c2rj0iv3-6wcz4o8b6wah.vcd4.mcprev.cn']
            // }
        };
    } else {
        // command === 'build'
        return {
            ...common
            // build 独有配置
        };
    }
});
