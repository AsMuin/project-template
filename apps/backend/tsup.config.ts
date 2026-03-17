import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['server.ts'], // Entry file for the backend
    format: ['esm'], // Output ESM since the project uses "type": "module"
    target: 'node20', // Specify Node version for target
    splitting: false,
    sourcemap: true, // Enable sourcemaps for debugging
    clean: true, // Clean the output directory before building
    minify: process.env.NODE_ENV === 'production' // Minify in production
});
