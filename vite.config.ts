import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

const env = loadEnv('development', process.cwd(), '');

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
                '@env': resolve(__dirname, './envConfig.ts')
            }
        },

        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: isDev ? 'inline' : false,
            minify: isDev ? false : 'oxc',
            rollupOptions: {
                input: {
                    popup: resolve(__dirname, 'index.html')
                }
            }
        },
        define: {
            // 在开发环境中模拟 chrome 对象
            'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
            'process.env.DEV': env.NODE_ENV !== 'production',
            global: 'globalThis',
            'process.platform': '"browser"',
            'process.env': {}
        },
        optimizeDeps: {
            esbuildOptions: {
                // 确保 esbuild 正确处理全局对象
                define: {
                    global: 'globalThis'
                }
            }
        }
    };
});
