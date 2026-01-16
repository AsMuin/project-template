// vite.content.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
                '@env': resolve(__dirname, './envConfig.ts')
            }
        },
        build: {
            emptyOutDir: false,
            outDir: 'dist',
            sourcemap: isDev ? 'inline' : false,
            minify: isDev ? false : 'oxc',
            lib: {
                entry: resolve(__dirname, 'src/scripts/mock_boot.ts'),
                name: 'MockBoot',
                fileName: () => 'mock_boot.js',
                formats: ['iife']
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: true
                }
            }
        }
    };
});
