import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

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
            tailwindcss()
        ],
        resolve: { alias: { '@': resolve(__dirname, './src'), '@env': resolve(__dirname, './envConfig.ts') } }
    };

    if (command === 'serve') {
        return {
            ...common
        };
    } else {
        // command === 'build'
        return {
            ...common
            // build 独有配置
        };
    }
});
